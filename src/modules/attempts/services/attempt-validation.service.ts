import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ValidatedAttemptContext } from '../types/attempt.types';
import { AttemptsRepository } from '../repositories/attempts.repository';

@Injectable()
export class AttemptValidationService {
  constructor(private readonly repository: AttemptsRepository) {}

  async validateAndBuildContext(
    userId: string,
    diagnosisId: string,
    testIds: string[],
    treatmentIds: string[],
  ): Promise<ValidatedAttemptContext> {
    if (testIds.length === 0) {
      throw new BadRequestException('At least one test must be selected');
    }
    if (treatmentIds.length === 0) {
      throw new BadRequestException('At least one treatment must be selected');
    }

    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dailyCase = await this.repository.findDailyCaseByDate(new Date());
    if (!dailyCase?.Case) {
      throw new NotFoundException('No daily case available for today');
    }

    const existingAttempt = await this.repository.findExistingAttempt(userId, dailyCase.Case.Id);
    if (existingAttempt) {
      throw new ForbiddenException('Daily case already completed');
    }

    const caseTests = await this.repository.findCaseTestsByCaseId(dailyCase.Case.Id);
    const caseTreatments = await this.repository.findCaseTreatmentsByCaseId(dailyCase.Case.Id);

    const validTestIds = new Set(caseTests.map((ct) => ct.TestId));
    const validTreatmentIds = new Set(caseTreatments.map((ct) => ct.TreatmentId));

    const invalidTests = testIds.filter((id) => !validTestIds.has(id));
    if (invalidTests.length > 0) {
      throw new BadRequestException(`Invalid test IDs: ${invalidTests.join(', ')}`);
    }

    const invalidTreatments = treatmentIds.filter((id) => !validTreatmentIds.has(id));
    if (invalidTreatments.length > 0) {
      throw new BadRequestException(`Invalid treatment IDs: ${invalidTreatments.join(', ')}`);
    }

    const diagnosis = await this.repository.findDiagnosisById(diagnosisId);
    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return { user, dailyCase, case: dailyCase.Case, caseTests, caseTreatments, diagnosis };
  }
}
