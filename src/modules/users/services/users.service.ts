import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
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

  async setRefreshToken(
    userId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.setRefreshToken(
      userId,
      refreshTokenHash,
      refreshTokenExpiresAt,
    );
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.userRepository.clearRefreshToken(userId);
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
    };
  }
}
