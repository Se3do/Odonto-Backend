import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { LeaderboardEntryDto } from '../dto/user-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';

const MAX_LEADERBOARD_LIMIT = 50;
const DEFAULT_LEADERBOARD_LIMIT = 10;

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('leaderboard')
  getLeaderboard(
    @Query('limit') limit?: string,
  ): Promise<LeaderboardEntryDto[]> {
    return this.usersService.getLeaderboard(this.parseLimit(limit));
  }

  private parseLimit(value?: string): number {
    if (!value) {
      return DEFAULT_LEADERBOARD_LIMIT;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive integer');
    }
    return Math.min(parsed, MAX_LEADERBOARD_LIMIT);
  }
}
