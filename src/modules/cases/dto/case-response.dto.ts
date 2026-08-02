export class CaseTestResponseDto {
  testId!: string;
  testName!: string;
  isCorrect!: boolean;
}

export class CaseTreatmentResponseDto {
  treatmentId!: string;
  treatmentName!: string;
  isCorrect!: boolean;
}

export class CaseResponseDto {
  id!: string;
  title!: string;
  patientHistory!: string;
  diagnosisExplanation!: string;
  difficulty!: string;
  specialtyId!: string;
  specialtyName!: string;
  diagnosisId!: string;
  diagnosisName!: string;
  tests!: CaseTestResponseDto[];
  treatments!: CaseTreatmentResponseDto[];
  createdAt!: Date;
}

export class PaginatedCaseResponseDto {
  data!: CaseResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}
