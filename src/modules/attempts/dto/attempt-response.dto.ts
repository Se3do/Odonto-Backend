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

export class AttemptDetailDto {
  id!: string;
  score!: number;
  xpEarned!: number;
  startedAt!: Date;
  completedAt!: Date | null;
  userId!: string;
  caseId!: string;
  chosenDiagnosisId!: string;
  case!: { id: string; title: string; difficulty: string };
  diagnosis!: { id: string; name: string };
  tests!: { testId: string; testName: string; isCorrect: boolean }[];
  treatments!: { treatmentId: string; treatmentName: string; isCorrect: boolean }[];
}

export class AttemptListItemDto {
  id!: string;
  score!: number;
  xpEarned!: number;
  completedAt!: Date | null;
  caseTitle!: string;
}
