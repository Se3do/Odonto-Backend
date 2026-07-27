import { Module } from '@nestjs/common';
import { DiagnosesController } from './controllers/diagnoses.controller';
import { DiagnosesService } from './services/diagnoses.service';
import { DiagnosesRepository } from './repositories/diagnoses.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DiagnosesController],
  providers: [DiagnosesService, DiagnosesRepository],
  exports: [DiagnosesService],
})
export class DiagnosesModule {}
