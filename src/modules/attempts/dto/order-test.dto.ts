import { IsString, IsUUID } from 'class-validator';

export class OrderTestDto {
  @IsString()
  @IsUUID('loose')
  testId!: string;
}
