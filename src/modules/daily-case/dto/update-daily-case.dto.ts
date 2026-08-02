import { IsUUID } from 'class-validator';

export class UpdateDailyCaseDto {
  @IsUUID('loose')
  caseId!: string;
}
