import { Injectable } from '@nestjs/common';
import { Difficulty } from '@prisma/client';
import { ScoringResult, TestResult, TreatmentResult } from '../types/attempt.types';

const SCORE_WEIGHTS = {
  [Difficulty.EASY]: { diagnosis: 40, tests: 30, treatments: 30 },
  [Difficulty.MEDIUM]: { diagnosis: 40, tests: 30, treatments: 30 },
  [Difficulty.HARD]: { diagnosis: 40, tests: 30, treatments: 30 },
};

@Injectable()
export class AttemptScoringService {
  score(
    chosenDiagnosisId: string,
    correctDiagnosisId: string,
    submittedTestIds: string[],
    correctTestIds: string[],
    allCaseTestIds: string[],
    submittedTreatmentIds: string[],
    correctTreatmentIds: string[],
    allCaseTreatmentIds: string[],
    difficulty: Difficulty,
  ): ScoringResult {
    const diagnosisCorrect = chosenDiagnosisId === correctDiagnosisId;

    const testResults = this.scoreTests(submittedTestIds, correctTestIds, allCaseTestIds);
    const treatmentResults = this.scoreTreatments(submittedTreatmentIds, correctTreatmentIds, allCaseTreatmentIds);

    const finalScore = this.calculateFinalScore(
      diagnosisCorrect,
      testResults,
      treatmentResults,
      difficulty,
    );

    return { diagnosisCorrect, testResults, treatmentResults, finalScore };
  }

  private scoreTests(
    submittedIds: string[],
    correctIds: string[],
    allIds: string[],
  ): TestResult[] {
    const correctSet = new Set(correctIds);
    const submittedSet = new Set(submittedIds);

    return allIds.map((testId) => ({
      testId,
      correct: submittedSet.has(testId) === correctSet.has(testId),
    }));
  }

  private scoreTreatments(
    submittedIds: string[],
    correctIds: string[],
    allIds: string[],
  ): TreatmentResult[] {
    const correctSet = new Set(correctIds);
    const submittedSet = new Set(submittedIds);

    return allIds.map((treatmentId) => ({
      treatmentId,
      correct: submittedSet.has(treatmentId) === correctSet.has(treatmentId),
    }));
  }

  private calculateFinalScore(
    diagnosisCorrect: boolean,
    testResults: TestResult[],
    treatmentResults: TreatmentResult[],
    difficulty: Difficulty,
  ): number {
    const weights = SCORE_WEIGHTS[difficulty];

    const diagnosisScore = diagnosisCorrect ? weights.diagnosis : 0;

    const correctTests = testResults.filter((t) => t.correct).length;
    const testsScore =
      testResults.length > 0
        ? (correctTests / testResults.length) * weights.tests
        : 0;

    const correctTreatments = treatmentResults.filter((t) => t.correct).length;
    const treatmentsScore =
      treatmentResults.length > 0
        ? (correctTreatments / treatmentResults.length) * weights.treatments
        : 0;

    return Math.round(diagnosisScore + testsScore + treatmentsScore);
  }
}
