import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  refreshTokenHash?: string | null;
  refreshTokenExpiresAt?: Date | null;
  xpTotal?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastCompletedDate?: Date | null;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  refreshTokenHash?: string | null;
  refreshTokenExpiresAt?: Date | null;
}

export interface UserExistsCriteria {
  id?: string;
  email?: string;
  username?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateUserData): Promise<User> {
    return this.prismaService.user.create({
      data: {
        UserName: data.username,
        Email: data.email,
        PasswordHash: data.passwordHash,
        RefreshTokenHash: data.refreshTokenHash ?? null,
        RefreshTokenExpiresAt: data.refreshTokenExpiresAt ?? null,
        XpTotal: data.xpTotal ?? 0,
        CurrentStreak: data.currentStreak ?? 0,
        LongestStreak: data.longestStreak ?? 0,
        LastCompletedDate: data.lastCompletedDate ?? null,
      },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        Id: id,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        Email: email,
      },
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        UserName: username,
      },
    });
  }

  update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.username !== undefined) {
      updateData.UserName = data.username;
    }

    if (data.email !== undefined) {
      updateData.Email = data.email;
    }

    if (data.refreshTokenHash !== undefined) {
      updateData.RefreshTokenHash = data.refreshTokenHash;
    }

    if (data.refreshTokenExpiresAt !== undefined) {
      updateData.RefreshTokenExpiresAt = data.refreshTokenExpiresAt;
    }

    return this.prismaService.user.update({
      where: {
        Id: id,
      },
      data: updateData,
    });
  }

  delete(id: string): Promise<User> {
    return this.prismaService.user.delete({
      where: {
        Id: id,
      },
    });
  }

  setRefreshToken(
    id: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<User> {
    return this.update(id, {
      refreshTokenHash,
      refreshTokenExpiresAt,
    });
  }

  clearRefreshToken(id: string): Promise<User> {
    return this.update(id, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  }

  async exists(criteria: UserExistsCriteria): Promise<boolean> {
    const filters: Prisma.UserWhereInput[] = [];

    if (criteria.id) {
      filters.push({ Id: criteria.id });
    }

    if (criteria.email) {
      filters.push({ Email: criteria.email });
    }

    if (criteria.username) {
      filters.push({ UserName: criteria.username });
    }

    if (filters.length === 0) {
      return false;
    }

    const count = await this.prismaService.user.count({
      where:
        filters.length === 1
          ? filters[0]
          : {
              OR: filters,
            },
    });

    return count > 0;
  }
}
