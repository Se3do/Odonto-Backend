import { Module } from '@nestjs/common';
import { SpecialtiesController } from './controllers/specialties.controller';
import { SpecialtiesService } from './services/specialties.service';
import { SpecialtiesRepository } from './repositories/specialties.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, SpecialtiesRepository],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
