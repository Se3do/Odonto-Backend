import { Module } from '@nestjs/common';
import { DiagnosticTestsController } from './controllers/diagnostic-tests.controller';
import { DiagnosticTestsService } from './services/diagnostic-tests.service';
import { DiagnosticTestsRepository } from './repositories/diagnostic-tests.repository';

@Module({
  controllers: [DiagnosticTestsController],
  providers: [DiagnosticTestsService, DiagnosticTestsRepository],
  exports: [DiagnosticTestsService],
})
export class DiagnosticTestsModule {}
