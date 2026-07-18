import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDiagnosisDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name!: string;
}
