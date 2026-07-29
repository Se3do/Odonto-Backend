import { Case, CaseTest, CaseTreatment, DailyCase, Diagnosis, Test, Treatment, User } from '@prisma/client';

export interface ValidatedAttemptContext {
  user: User;
  dailyCase: DailyCase;
  case: Case;
  caseTests: (CaseTest & { Test: Test })[];
  caseTreatments: (CaseTreatment & { Treatment: Treatment })[];
  diagnosis: Diagnosis;
}

export interface TestResult {
  testId: string;
  correct: boolean;
}

export interface TreatmentResult {
  treatmentId: string;
  correct: boolean;
}

export interface ScoringResult {
  diagnosisCorrect: boolean;
  testResults: TestResult[];
  treatmentResults: TreatmentResult[];
  finalScore: number;
}

export interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
}
