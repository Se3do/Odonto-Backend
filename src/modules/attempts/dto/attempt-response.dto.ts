import { TestResult, TreatmentResult } from '../types/attempt.types';

export class AttemptTestGroup {
  correct: { testId: string; testName: string }[] = [];
  incorrect: { testId: string; testName: string }[] = [];
  missed: { testId: string; testName: string }[] = [];
}

export class AttemptTreatmentGroup {
  correct: { treatmentId: string; treatmentName: string }[] = [];
  incorrect: { treatmentId: string; treatmentName: string }[] = [];
  missed: { treatmentId: string; treatmentName: string }[] = [];
}

export class AttemptResponseDto {
  id!: string;
  score!: number;
  xpEarned!: number;
  correctDiagnosis!: boolean;
  tests!: AttemptTestGroup;
  treatments!: AttemptTreatmentGroup;
  caseTitle!: string;
  caseDifficulty!: string;
}
