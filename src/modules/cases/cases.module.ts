import { Module } from '@nestjs/common';
import { CasesController } from './controllers/cases.controller';
import { CasesService } from './services/cases.service';
import { CasesRepository } from './repositories/cases.repository';
import { CaseValidationService } from './services/case-validation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CasesController],
  providers: [CasesService, CasesRepository, CaseValidationService],
})
export class CasesModule {}
