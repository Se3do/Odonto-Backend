import { IsArray, IsString, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @IsUUID()
  diagnosisId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  testIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  treatmentIds!: string[];
}
