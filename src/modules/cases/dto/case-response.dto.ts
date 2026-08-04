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

export class CaseImageResponseDto {
  id!: string;
  url!: string;
  imageType!: string;
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
  images!: CaseImageResponseDto[];
  createdAt!: Date;
}

export class PaginatedCaseResponseDto {
  data!: CaseResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}
