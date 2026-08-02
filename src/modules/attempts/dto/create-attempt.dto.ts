import { IsArray, IsString, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @IsUUID('loose')
  diagnosisId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('loose', { each: true })
  testIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('loose', { each: true })
  treatmentIds!: string[];
}
