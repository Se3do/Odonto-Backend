import { Module } from '@nestjs/common';
import { TreatmentsController } from './controllers/treatments.controller';
import { TreatmentsService } from './services/treatments.service';
import { TreatmentsRepository } from './repositories/treatments.repository';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, TreatmentsRepository],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
