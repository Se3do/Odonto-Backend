import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CasePhase } from '@prisma/client';
import { AttemptsRepository } from '../repositories/attempts.repository';
import { AttemptValidationService } from './attempt-validation.service';
import { AttemptScoringService } from './attempt-scoring.service';
import { XpService } from './xp.service';
import { StreakService } from './streak.service';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { OrderTestDto } from '../dto/order-test.dto';
import { DiagnoseDto } from '../dto/diagnose.dto';
import { TreatDto } from '../dto/treat.dto';
import {
  AttemptResponseDto,
  AttemptTestGroup,
  AttemptTreatmentGroup,
  AttemptDetailDto,
  AttemptListItemDto,
  StartAttemptResponseDto,
  OrderTestResponseDto,
  DiagnoseResponseDto,
  TreatResponseDto,
} from '../dto/attempt-response.dto';
import { ValidatedAttemptContext, ScoringResult } from '../types/attempt.types';

@Injectable()
export class AttemptService {
  constructor(
    private readonly repository: AttemptsRepository,
    private readonly validationService: AttemptValidationService,
    private readonly scoringService: AttemptScoringService,
    private readonly xpService: XpService,
    private readonly streakService: StreakService,
  ) {}

  async startAttempt(userId: string): Promise<StartAttemptResponseDto> {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const dailyCase = await this.repository.findDailyCaseByDate(new Date());
    if (!dailyCase?.Case) throw new NotFoundException('No daily case available for today');

    const existing = await this.repository.findExistingAttempt(userId, dailyCase.Case.Id);
    if (existing) throw new ForbiddenException('Daily case already completed');

    const caseTests = await this.repository.findCaseTestsByCaseId(dailyCase.Case.Id);

    const attempt = await this.repository.runTransaction(async (tx) => {
      return tx.userAttempt.create({
        data: {
          Phase: CasePhase.TESTING,
          Budget: 5,
          TestsUsed: 0,
          StartedAt: new Date(),
          User: { connect: { Id: userId } },
          Case: { connect: { Id: dailyCase.Case.Id } },
        },
      });
    });

    return {
      attemptId: attempt.Id,
      phase: CasePhase.TESTING,
      budget: 5,
      testsUsed: 0,
      case: {
        id: dailyCase.Case.Id,
        title: dailyCase.Case.Title,
        patientHistory: dailyCase.Case.PatientHistory,
        difficulty: dailyCase.Case.Difficulty,
      },
      availableTests: caseTests.map((ct) => ({
        testId: ct.TestId,
        testName: ct.Test.Name,
        cost: ct.TestCost,
      })),
    };
  }

  async orderTest(attemptId: string, dto: OrderTestDto): Promise<OrderTestResponseDto> {
    const attempt = await this.repository.findAttemptById(attemptId);
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (attempt.Phase !== CasePhase.TESTING) {
      throw new BadRequestException('Can only order tests during the TESTING phase');
    }

    if (attempt.TestsUsed >= attempt.Budget) {
      throw new BadRequestException('Test budget exhausted');
    }

    const caseTest = await this.repository.findCaseTestByCaseAndTest(attempt.CaseId, dto.testId);
    if (!caseTest) throw new BadRequestException('Test not available for this case');

    const existing = await this.repository.findAttemptTest(attemptId, attempt.CaseId, dto.testId);
    if (existing) throw new BadRequestException('Test already ordered');

    await this.repository.runTransaction(async (tx) => {
      await tx.attemptTest.create({
        data: {
          AttemptId: attemptId,
          CaseId: attempt.CaseId,
          TestId: dto.testId,
        },
      });
      await tx.userAttempt.update({
        where: { Id: attemptId },
        data: { TestsUsed: { increment: 1 } },
      });
    });

    return {
      attemptId,
      phase: CasePhase.TESTING,
      testId: dto.testId,
      testName: caseTest.Test.Name,
      result: caseTest.TestResult,
      budget: attempt.Budget,
      testsUsed: attempt.TestsUsed + 1,
    };
  }

  async submitDiagnosis(attemptId: string, dto: DiagnoseDto): Promise<DiagnoseResponseDto> {
    const attempt = await this.repository.findAttemptByIdWithCase(attemptId);
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (attempt.Phase !== CasePhase.TESTING && attempt.Phase !== CasePhase.DIAGNOSING) {
      throw new BadRequestException('Can only submit diagnosis during TESTING or DIAGNOSING phase');
    }

    const diagnosis = await this.repository.findDiagnosisById(dto.diagnosisId);
    if (!diagnosis) throw new NotFoundException('Diagnosis not found');

    const correctDiagnosisId = attempt.Case.Diagnosis.Id;
    const diagnosisCorrect = dto.diagnosisId === correctDiagnosisId;

    await this.repository.runTransaction(async (tx) => {
      await tx.userAttempt.update({
        where: { Id: attemptId },
        data: {
          ChosenDiagnosisId: dto.diagnosisId,
          Phase: CasePhase.TREATING,
        },
      });
    });

    return {
      attemptId,
      phase: CasePhase.TREATING,
      diagnosisId: dto.diagnosisId,
      diagnosisCorrect,
      correctDiagnosisId,
      correctDiagnosisName: attempt.Case.Diagnosis.Name,
    };
  }

  async submitTreatments(attemptId: string, dto: TreatDto): Promise<TreatResponseDto> {
    const attempt = await this.repository.findAttemptByIdWithCase(attemptId);
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (attempt.Phase !== CasePhase.TREATING) {
      throw new BadRequestException('Can only submit treatments during the TREATING phase');
    }

    if (!attempt.ChosenDiagnosisId) {
      throw new BadRequestException('Diagnosis must be submitted before treatments');
    }

    const caseTreatments = await this.repository.findCaseTreatmentsByCaseId(attempt.CaseId);
    const caseTests = await this.repository.findCaseTestsByCaseId(attempt.CaseId);

    const validTreatmentIds = new Set(caseTreatments.map((ct) => ct.TreatmentId));
    const invalidTreatments = dto.treatmentIds.filter((id) => !validTreatmentIds.has(id));
    if (invalidTreatments.length > 0) {
      throw new BadRequestException(`Invalid treatment IDs: ${invalidTreatments.join(', ')}`);
    }

    const correctTestIds = caseTests.filter((ct) => ct.IsCorrect).map((ct) => ct.TestId);
    const allCaseTestIds = caseTests.map((ct) => ct.TestId);
    const orderedTestIds = attempt.AttemptTests.map((at) => at.TestId);

    const correctTreatmentIds = caseTreatments.filter((ct) => ct.IsCorrect).map((ct) => ct.TreatmentId);
    const allCaseTreatmentIds = caseTreatments.map((ct) => ct.TreatmentId);

    const scoringResult = this.scoringService.score(
      attempt.ChosenDiagnosisId,
      attempt.Case.Diagnosis.Id,
      orderedTestIds,
      correctTestIds,
      allCaseTestIds,
      dto.treatmentIds,
      correctTreatmentIds,
      allCaseTreatmentIds,
      attempt.Case.Difficulty,
    );

    const xpEarned = this.xpService.calculate(scoringResult.finalScore, attempt.Case.Difficulty);

    const streakUpdate = this.streakService.calculate(
      attempt.User?.LastCompletedDate ?? null,
      attempt.User?.CurrentStreak ?? 0,
    );

    const newLongestStreak = Math.max(
      streakUpdate.currentStreak,
      attempt.User?.LongestStreak ?? 0,
    );

    await this.repository.runTransaction(async (tx) => {
      await tx.attemptTreatment.createMany({
        data: dto.treatmentIds.map((treatmentId) => ({
          AttemptId: attemptId,
          CaseId: attempt.CaseId,
          TreatmentId: treatmentId,
        })),
      });

      await tx.userAttempt.update({
        where: { Id: attemptId },
        data: {
          Score: scoringResult.finalScore,
          XpEarned: xpEarned,
          CompletedAt: new Date(),
          Phase: CasePhase.COMPLETED,
        },
      });

      await tx.user.update({
        where: { Id: attempt.UserId },
        data: {
          XpTotal: { increment: xpEarned },
          CurrentStreak: streakUpdate.currentStreak,
          LongestStreak: newLongestStreak,
          LastCompletedDate: streakUpdate.lastCompletedDate,
        },
      });
    });

    return this.buildTreatResponse(scoringResult, attempt, dto.treatmentIds, xpEarned);
  }

  async submitAttempt(
    userId: string,
    dto: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    const ctx = await this.validationService.validateAndBuildContext(
      userId,
      dto.diagnosisId,
      dto.testIds,
      dto.treatmentIds,
    );

    const correctTestIds = ctx.caseTests
      .filter((ct) => ct.IsCorrect)
      .map((ct) => ct.TestId);
    const allCaseTestIds = ctx.caseTests.map((ct) => ct.TestId);

    const correctTreatmentIds = ctx.caseTreatments
      .filter((ct) => ct.IsCorrect)
      .map((ct) => ct.TreatmentId);
    const allCaseTreatmentIds = ctx.caseTreatments.map((ct) => ct.TreatmentId);

    const scoringResult = this.scoringService.score(
      ctx.diagnosis.Id,
      ctx.case.DiagnosisId,
      dto.testIds,
      correctTestIds,
      allCaseTestIds,
      dto.treatmentIds,
      correctTreatmentIds,
      allCaseTreatmentIds,
      ctx.case.Difficulty,
    );

    const xpEarned = this.xpService.calculate(scoringResult.finalScore, ctx.case.Difficulty);

    const streakUpdate = this.streakService.calculate(
      ctx.user.LastCompletedDate,
      ctx.user.CurrentStreak,
    );

    const newLongestStreak = Math.max(streakUpdate.currentStreak, ctx.user.LongestStreak);

    const attemptId = await this.repository.runTransaction(async (tx) => {
      const attempt = await tx.userAttempt.create({
        data: {
          Score: scoringResult.finalScore,
          XpEarned: xpEarned,
          StartedAt: ctx.dailyCase.Date,
          CompletedAt: new Date(),
          Phase: CasePhase.COMPLETED,
          Budget: 5,
          TestsUsed: dto.testIds.length,
          User: { connect: { Id: ctx.user.Id } },
          Case: { connect: { Id: ctx.case.Id } },
          Diagnosis: { connect: { Id: ctx.diagnosis.Id } },
        },
      });

      await tx.attemptTest.createMany({
        data: dto.testIds.map((testId) => ({
          AttemptId: attempt.Id,
          CaseId: ctx.case.Id,
          TestId: testId,
        })),
      });

      await tx.attemptTreatment.createMany({
        data: dto.treatmentIds.map((treatmentId) => ({
          AttemptId: attempt.Id,
          CaseId: ctx.case.Id,
          TreatmentId: treatmentId,
        })),
      });

      await tx.user.update({
        where: { Id: ctx.user.Id },
        data: {
          XpTotal: { increment: xpEarned },
          CurrentStreak: streakUpdate.currentStreak,
          LongestStreak: newLongestStreak,
          LastCompletedDate: streakUpdate.lastCompletedDate,
        },
      });

      return attempt.Id;
    });

    return this.buildResponse(
      scoringResult,
      ctx,
      dto.testIds,
      dto.treatmentIds,
      attemptId,
      xpEarned,
    );
  }

  async getAttemptById(id: string): Promise<AttemptDetailDto | null> {
    const attempt = await this.repository.findAttemptByIdWithCase(id);
    return attempt ? this.toDetailDto(attempt) : null;
  }

  async getAttemptsByUserId(userId: string): Promise<AttemptListItemDto[]> {
    const attempts = await this.repository.findAttemptsByUserId(userId);
    return attempts.map((a) => ({
      id: a.Id,
      score: a.Score,
      xpEarned: a.XpEarned,
      completedAt: a.CompletedAt,
      caseTitle: a.Case.Title,
      phase: a.Phase,
    }));
  }

  private toDetailDto(a: any): AttemptDetailDto {
    return {
      id: a.Id,
      score: a.Score ?? null,
      xpEarned: a.XpEarned ?? null,
      startedAt: a.StartedAt,
      completedAt: a.CompletedAt,
      userId: a.UserId,
      caseId: a.CaseId,
      phase: a.Phase,
      budget: a.Budget,
      testsUsed: a.TestsUsed,
      chosenDiagnosisId: a.ChosenDiagnosisId ?? null,
      correctDiagnosis: a.ChosenDiagnosisId
        ? a.Case.Diagnosis.Id === a.ChosenDiagnosisId
        : false,
      correctDiagnosisId: a.Case.Diagnosis.Id,
      correctDiagnosisName: a.Case.Diagnosis.Name,
      diagnosisExplanation: a.Case.DiagnosisExplanation,
      case: {
        id: a.Case.Id,
        title: a.Case.Title,
        difficulty: a.Case.Difficulty,
      },
      diagnosis: a.Diagnosis ? { id: a.Diagnosis.Id, name: a.Diagnosis.Name } : null,
      tests: a.Case.CaseTests.map((ct: any) => ({
        testId: ct.TestId,
        testName: ct.Test.Name,
        isCorrect: ct.IsCorrect,
        result: ct.TestResult,
      })),
      treatments: a.Case.CaseTreatments.map((ct: any) => ({
        treatmentId: ct.TreatmentId,
        treatmentName: ct.Treatment.Name,
        isCorrect: ct.IsCorrect,
      })),
      orderedTests: a.AttemptTests.map((at: any) => ({
        testId: at.TestId,
        testName: at.CaseTest.Test.Name,
        result: at.CaseTest.TestResult,
      })),
    };
  }

  private buildTreatResponse(
    scoringResult: ScoringResult,
    attempt: any,
    submittedTreatmentIds: string[],
    xpEarned: number,
  ): TreatResponseDto {
    const caseTests = attempt.Case?.CaseTests ?? [];
    const caseTreatments = attempt.Case?.CaseTreatments ?? [];
    const orderedTestIds = attempt.AttemptTests.map((at: any) => at.TestId);

    const testNameMap = new Map<string, string>(caseTests.map((ct: any) => [ct.TestId, ct.Test.Name as string]));
    const treatmentNameMap = new Map<string, string>(caseTreatments.map((ct: any) => [ct.TreatmentId, ct.Treatment.Name as string]));

    const tests = new AttemptTestGroup();
    for (const r of scoringResult.testResults) {
      const entry = { testId: r.testId, testName: testNameMap.get(r.testId) ?? '' };
      if (r.correct) {
        tests.correct.push(entry);
      } else if (orderedTestIds.includes(r.testId)) {
        tests.incorrect.push(entry);
      } else {
        tests.missed.push(entry);
      }
    }

    const treatments = new AttemptTreatmentGroup();
    for (const r of scoringResult.treatmentResults) {
      const entry = { treatmentId: r.treatmentId, treatmentName: treatmentNameMap.get(r.treatmentId) ?? '' };
      if (r.correct) {
        treatments.correct.push(entry);
      } else if (submittedTreatmentIds.includes(r.treatmentId)) {
        treatments.incorrect.push(entry);
      } else {
        treatments.missed.push(entry);
      }
    }

    return {
      attemptId: attempt.Id,
      phase: CasePhase.COMPLETED,
      score: scoringResult.finalScore,
      xpEarned,
      correctDiagnosis: scoringResult.diagnosisCorrect,
      tests,
      treatments,
      caseTitle: attempt.Case.Title,
      caseDifficulty: attempt.Case.Difficulty,
    };
  }

  private buildResponse(
    scoringResult: ScoringResult,
    ctx: ValidatedAttemptContext,
    submittedTestIds: string[],
    submittedTreatmentIds: string[],
    attemptId: string,
    xpEarned: number,
  ): AttemptResponseDto {
    const testNameMap = new Map(
      ctx.caseTests.map((ct) => [ct.TestId, ct.Test.Name]),
    );
    const treatmentNameMap = new Map(
      ctx.caseTreatments.map((ct) => [ct.TreatmentId, ct.Treatment.Name]),
    );

    const tests = new AttemptTestGroup();
    for (const r of scoringResult.testResults) {
      const entry = { testId: r.testId, testName: testNameMap.get(r.testId) ?? '' };
      if (r.correct) {
        tests.correct.push(entry);
      } else if (submittedTestIds.includes(r.testId)) {
        tests.incorrect.push(entry);
      } else {
        tests.missed.push(entry);
      }
    }

    const treatments = new AttemptTreatmentGroup();
    for (const r of scoringResult.treatmentResults) {
      const entry = { treatmentId: r.treatmentId, treatmentName: treatmentNameMap.get(r.treatmentId) ?? '' };
      if (r.correct) {
        treatments.correct.push(entry);
      } else if (submittedTreatmentIds.includes(r.treatmentId)) {
        treatments.incorrect.push(entry);
      } else {
        treatments.missed.push(entry);
      }
    }

    return {
      id: attemptId,
      score: scoringResult.finalScore,
      xpEarned,
      correctDiagnosis: scoringResult.diagnosisCorrect,
      tests,
      treatments,
      caseTitle: ctx.case.Title,
      caseDifficulty: ctx.case.Difficulty,
    };
  }
}
