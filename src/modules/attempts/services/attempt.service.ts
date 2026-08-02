import { Injectable } from '@nestjs/common';
import { AttemptsRepository } from '../repositories/attempts.repository';
import { AttemptValidationService } from './attempt-validation.service';
import { AttemptScoringService } from './attempt-scoring.service';
import { XpService } from './xp.service';
import { StreakService } from './streak.service';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { AttemptResponseDto, AttemptTestGroup, AttemptTreatmentGroup, AttemptDetailDto, AttemptListItemDto } from '../dto/attempt-response.dto';
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
    const attempt = await this.repository.findAttemptById(id);
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
    }));
  }

  private toDetailDto(a: any): AttemptDetailDto {
    return {
      id: a.Id,
      score: a.Score,
      xpEarned: a.XpEarned,
      startedAt: a.StartedAt,
      completedAt: a.CompletedAt,
      userId: a.UserId,
      caseId: a.CaseId,
      chosenDiagnosisId: a.ChosenDiagnosisId,
      case: {
        id: a.Case.Id,
        title: a.Case.Title,
        difficulty: a.Case.Difficulty,
      },
      diagnosis: {
        id: a.Diagnosis.Id,
        name: a.Diagnosis.Name,
      },
      tests: a.AttemptTests.map((at: any) => ({
        testId: at.TestId,
        testName: at.CaseTest.Test.Name,
        isCorrect: at.CaseTest.IsCorrect,
      })),
      treatments: a.AttemptTreatments.map((at: any) => ({
        treatmentId: at.TreatmentId,
        treatmentName: at.CaseTreatment.Treatment.Name,
        isCorrect: at.CaseTreatment.IsCorrect,
      })),
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
