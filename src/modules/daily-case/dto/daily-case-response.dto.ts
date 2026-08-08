export class DailyCaseResponseDto {
  id!: string;
  date!: string;
  caseId!: string;
  case!: CaseSummaryDto;
}

export class CaseSummaryDto {
  id!: string;
  title!: string;
  difficulty!: string;
}

export class TodayDailyCaseResponseDto {
  id!: string;
  date!: string;
  case!: TodayCaseSummaryDto;
}

export class TodayCaseSummaryDto {
  id!: string;
  title!: string;
  difficulty!: string;
  patientHistory!: string;
  specialtyId!: string;
  specialtyName!: string;
  tests!: { testId: string; testName: string }[];
  treatments!: { treatmentId: string; treatmentName: string }[];
  images!: { id: string; url: string; imageType: string }[];
}
