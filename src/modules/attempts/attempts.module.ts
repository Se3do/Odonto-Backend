import { Module } from '@nestjs/common';
import { AttemptsController } from './controllers/attempts.controller';
import { AttemptService } from './services/attempt.service';
import { AttemptsRepository } from './repositories/attempts.repository';
import { AttemptValidationService } from './services/attempt-validation.service';
import { AttemptScoringService } from './services/attempt-scoring.service';
import { XpService } from './services/xp.service';
import { StreakService } from './services/streak.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AttemptsController],
  providers: [
    AttemptService,
    AttemptsRepository,
    AttemptValidationService,
    AttemptScoringService,
    XpService,
    StreakService,
  ],
})
export class AttemptsModule {}
