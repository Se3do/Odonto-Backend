import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
