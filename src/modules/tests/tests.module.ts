import { Module } from '@nestjs/common';
import { TestsController } from './controllers/tests.controller';
import { TestsService } from './services/tests.service';
import { TestsRepository } from './repositories/tests.repository';

@Module({
  controllers: [TestsController],
  providers: [TestsService, TestsRepository],
  exports: [TestsService],
})
export class TestsModule {}
