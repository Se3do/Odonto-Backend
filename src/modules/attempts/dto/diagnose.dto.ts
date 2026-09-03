import { IsString, IsUUID } from 'class-validator';

export class DiagnoseDto {
  @IsString()
  @IsUUID('loose')
  diagnosisId!: string;
}
