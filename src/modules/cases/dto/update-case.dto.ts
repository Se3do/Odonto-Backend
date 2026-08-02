import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, ArrayNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '@prisma/client';
import { CaseTestItemDto, CaseTreatmentItemDto } from './create-case.dto';

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  patientHistory?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  diagnosisExplanation?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsUUID('loose')
  diagnosisId?: string;

  @IsOptional()
  @IsUUID('loose')
  specialtyId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CaseTestItemDto)
  tests?: CaseTestItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CaseTreatmentItemDto)
  treatments?: CaseTreatmentItemDto[];
}
