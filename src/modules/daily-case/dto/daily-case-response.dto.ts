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
