import { Module } from '@nestjs/common';
import { SpecialtiesController } from './controllers/specialties.controller';
import { SpecialtiesService } from './services/specialties.service';
import { SpecialtiesRepository } from './repositories/specialties.repository';

@Module({
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, SpecialtiesRepository],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
