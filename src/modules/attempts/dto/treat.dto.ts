import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class TreatDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('loose', { each: true })
  treatmentIds!: string[];
}
