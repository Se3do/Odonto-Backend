import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserResponseDto, LeaderboardEntryDto, UserStatsDto } from '../dto/user-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/services/token.service';

const MAX_LEADERBOARD_LIMIT = 50;
const DEFAULT_LEADERBOARD_LIMIT = 10;

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AccessTokenPayload): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  @Get('stats')
  getStats(@CurrentUser() user: AccessTokenPayload): Promise<UserStatsDto> {
    return this.usersService.getStats(user.sub);
  }

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
