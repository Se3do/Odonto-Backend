import { IsUUID, Matches } from 'class-validator';

export class CreateDailyCaseDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsUUID('loose')
  caseId!: string;
}
