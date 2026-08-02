import { IsArray, IsBoolean, IsEnum, IsString, IsUUID, ArrayNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '@prisma/client';

export class CaseTestItemDto {
  @IsUUID('loose')
  id!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CaseTreatmentItemDto {
  @IsUUID('loose')
  id!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateCaseDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  patientHistory!: string;

  @IsString()
  @MinLength(10)
  diagnosisExplanation!: string;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsUUID('loose')
  diagnosisId!: string;

  @IsUUID('loose')
  specialtyId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CaseTestItemDto)
  tests!: CaseTestItemDto[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CaseTreatmentItemDto)
  treatments!: CaseTreatmentItemDto[];
}
