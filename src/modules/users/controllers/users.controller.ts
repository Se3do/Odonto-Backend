import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from '../services/users.service';
import {
  AdminUserListDto,
  UserResponseDto,
  LeaderboardEntryDto,
  UserStatsDto,
} from '../dto/user-response.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/services/token.service';

const avatarUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (err: Error | null, accept: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

const MAX_LEADERBOARD_LIMIT = 50;
const DEFAULT_LEADERBOARD_LIMIT = 10;

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  @Get('stats')
  getStats(@CurrentUser() user: AccessTokenPayload): Promise<UserStatsDto> {
    return this.usersService.getStats(user.sub);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<{ avatarUrl: string }> {
    return this.usersService.updateAvatar(user.sub, file);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Query('limit') limit?: string,
  ): Promise<LeaderboardEntryDto[]> {
    return this.usersService.getLeaderboard(this.parseLimit(limit));
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  listUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AdminUserListDto> {
    const parsedPage = Math.max(parseInt(page ?? '1', 10) || 1, 1);
    const parsedLimit = Math.min(
      Math.max(parseInt(limit ?? '20', 10) || 20, 1),
      100,
    );
    return this.usersService.listUsers(search ?? '', parsedPage, parsedLimit);
  }

  @Patch(':id/role')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRole(id, dto.role, user.sub);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    if (id === user.sub) {
      throw new BadRequestException('You cannot delete your own account');
    }
    return this.usersService.delete(id);
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
