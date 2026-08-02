import { Module } from '@nestjs/common';
import { DailyCaseController } from './controllers/daily-case.controller';
import { DailyCaseService } from './services/daily-case.service';
import { DailyCaseRepository } from './repositories/daily-case.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DailyCaseController],
  providers: [DailyCaseService, DailyCaseRepository],
})
export class DailyCaseModule {}
