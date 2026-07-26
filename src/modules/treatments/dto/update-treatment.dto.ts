import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTreatmentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;
}
