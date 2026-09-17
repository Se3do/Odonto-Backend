import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  AdminUserListDto,
  UserResponseDto,
  LeaderboardEntryDto,
  UserStatsDto,
} from '../dto/user-response.dto';
import {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createForAuth(createUserDto);
    return this.toResponseDto(user);
  }

  async createForAuth(createUserDto: CreateUserDto): Promise<User> {
    const username = this.normalizeUsername(createUserDto.username);
    const email = this.normalizeEmail(createUserDto.email);

    await this.ensureUsernameIsAvailable(username);
    await this.ensureEmailIsAvailable(email);

    const createData: CreateUserData = {
      username,
      email,
      passwordHash: createUserDto.passwordHash,
      xpTotal: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    return this.userRepository.create(createData);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    return this.toResponseDto(user);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.findById(userId);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(
      this.normalizeEmail(email),
    );
    return user ? this.toResponseDto(user) : null;
  }

  async findEntityByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(this.normalizeEmail(email));
  }

  async findEntityById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findEntityByResetTokenHash(
    resetTokenHash: string,
  ): Promise<User | null> {
    return this.userRepository.findByResetTokenHash(resetTokenHash);
  }

  async findByUsername(username: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByUsername(
      this.normalizeUsername(username),
    );
    return user ? this.toResponseDto(user) : null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const currentUser = await this.getUserOrThrow(id);
    const updateData: UpdateUserData = {};

    if (updateUserDto.username !== undefined) {
      const username = this.normalizeUsername(updateUserDto.username);

      if (username !== currentUser.UserName) {
        await this.ensureUsernameIsAvailable(username, id);
      }

      updateData.username = username;
    }

    if (updateUserDto.email !== undefined) {
      const email = this.normalizeEmail(updateUserDto.email);

      if (email !== currentUser.Email) {
        await this.ensureEmailIsAvailable(email, id);
      }

      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    const deletedUser = await this.userRepository.delete(user.Id);
    return this.toResponseDto(deletedUser);
  }

  async updateRole(
    id: string,
    role: UserRole,
    actorId: string,
  ): Promise<UserResponseDto> {
    await this.getUserOrThrow(id);

    if (id === actorId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot demote yourself');
    }

    const updatedUser = await this.userRepository.update(id, { role });
    return this.toResponseDto(updatedUser);
  }

  async listUsers(
    search: string,
    page: number,
    limit: number,
  ): Promise<AdminUserListDto> {
    const [total, users] = await Promise.all([
      this.userRepository.countUsers(search),
      this.userRepository.listUsers(search, (page - 1) * limit, limit),
    ]);

    return {
      items: users.map((u) => ({
        id: u.Id,
        username: u.UserName,
        email: u.Email,
        role: u.Role,
        xpTotal: u.XpTotal,
        currentStreak: u.CurrentStreak,
        longestStreak: u.LongestStreak,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      search,
    };
  }

  async setRefreshToken(
    userId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
    refreshTokenFamily: string,
  ): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.setRefreshToken(
      userId,
      refreshTokenHash,
      refreshTokenExpiresAt,
      refreshTokenFamily,
    );
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.clearRefreshToken(userId);
  }

  async setResetToken(
    userId: string,
    resetTokenHash: string,
    resetTokenExpiresAt: Date,
  ): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.setResetToken(
      userId,
      resetTokenHash,
      resetTokenExpiresAt,
    );
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.clearResetToken(userId);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.updatePassword(userId, passwordHash);
  }

  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const url = process.env.CLOUDINARY_URL ?? '';
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!m) {
      throw new BadRequestException('Cloudinary is not configured');
    }
    cloudinary.config({ cloud_name: m[3], api_key: m[1], api_secret: m[2] });
    const uploaded = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'odonto/avatars' },
          (error, result) => {
            if (error) {
              reject(new Error(error.message));
              return;
            }
            resolve(result as { secure_url: string });
          },
        );
        stream.end(file.buffer);
      },
    );
    await this.userRepository.update(userId, {
      avatarUrl: uploaded.secure_url,
    });
    return { avatarUrl: uploaded.secure_url };
  }

  async getLeaderboard(limit: number): Promise<LeaderboardEntryDto[]> {
    const users = await this.userRepository.getLeaderboard(limit);
    return users.map((u, i) => ({
      rank: i + 1,
      id: u.Id,
      username: u.UserName,
      xpTotal: u.XpTotal,
      currentStreak: u.CurrentStreak,
      longestStreak: u.LongestStreak,
    }));
  }

  async getStats(userId: string): Promise<UserStatsDto> {
    const user = await this.getUserOrThrow(userId);
    const agg = await this.userRepository.getAttemptStats(userId);
    return {
      totalAttempts: agg._count.Id,
      averageScore: agg._avg.Score,
      bestScore: agg._max.Score,
      totalXp: user.XpTotal,
      currentStreak: user.CurrentStreak,
      longestStreak: user.LongestStreak,
      lastCompletedDate: user.LastCompletedDate,
    };
  }

  private async getUserOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  private async ensureUsernameIsAvailable(
    username: string,
    currentUserId?: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(username);

    if (existingUser && existingUser.Id !== currentUserId) {
      throw new ConflictException('Username already exists');
    }
  }

  private async ensureEmailIsAvailable(
    email: string,
    currentUserId?: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.Id !== currentUserId) {
      throw new ConflictException('Email already exists');
    }
  }

  private normalizeUsername(username: string): string {
    return username.trim();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.Id,
      username: user.UserName,
      email: user.Email,
      role: user.Role,
      xpTotal: user.XpTotal,
      currentStreak: user.CurrentStreak,
      longestStreak: user.LongestStreak,
      avatarUrl: user.AvatarUrl,
    };
  }
}
