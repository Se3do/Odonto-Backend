import { CasePhase } from '@prisma/client';
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
  score!: number | null;
  xpEarned!: number | null;
  startedAt!: Date;
  completedAt!: Date | null;
  userId!: string;
  caseId!: string;
  phase!: CasePhase;
  budget!: number;
  testsUsed!: number;
  chosenDiagnosisId!: string | null;
  correctDiagnosis!: boolean;
  correctDiagnosisId!: string;
  correctDiagnosisName!: string;
  diagnosisExplanation!: string;
  case!: { id: string; title: string; difficulty: string };
  diagnosis!: { id: string; name: string } | null;
  tests!: { testId: string; testName: string; isCorrect: boolean; result: string }[];
  treatments!: { treatmentId: string; treatmentName: string; isCorrect: boolean }[];
  orderedTests!: { testId: string; testName: string; result: string }[];
}

export class AttemptListItemDto {
  id!: string;
  score!: number | null;
  xpEarned!: number | null;
  completedAt!: Date | null;
  caseTitle!: string;
  phase!: CasePhase;
}

export class StartAttemptResponseDto {
  attemptId!: string;
  phase!: CasePhase;
  budget!: number;
  testsUsed!: number;
  case!: {
    id: string;
    title: string;
    patientHistory: string;
    difficulty: string;
  };
  availableTests!: {
    testId: string;
    testName: string;
    cost: number;
  }[];
}

export class OrderTestResponseDto {
  attemptId!: string;
  phase!: CasePhase;
  testId!: string;
  testName!: string;
  result!: string;
  budget!: number;
  testsUsed!: number;
}

export class DiagnoseResponseDto {
  attemptId!: string;
  phase!: CasePhase;
  diagnosisId!: string;
  diagnosisCorrect!: boolean;
  correctDiagnosisId!: string;
  correctDiagnosisName!: string;
}

export class TreatResponseDto {
  attemptId!: string;
  phase!: CasePhase;
  score!: number;
  xpEarned!: number;
  correctDiagnosis!: boolean;
  tests!: AttemptTestGroup;
  treatments!: AttemptTreatmentGroup;
  caseTitle!: string;
  caseDifficulty!: string;
}
