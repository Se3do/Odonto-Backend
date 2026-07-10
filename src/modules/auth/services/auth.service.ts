import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UsersService } from '../../users/services/users.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { Role } from '../enums/roles.enum';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const email = this.normalizeEmail(registerDto.email);
    const existingUser = await this.usersService.findEntityByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);
    const user = await this.usersService.createForAuth({
      username: registerDto.username,
      email,
      passwordHash,
    });

    return this.issueTokensForUser(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authenticate(loginDto);
  }

  async adminLogin(loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authenticate(loginDto, Role.Admin);
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      refreshTokenDto.refreshToken,
    );
    const user = await this.findUserForRefresh(payload);
    await this.assertRefreshTokenMatches(user, refreshTokenDto.refreshToken);

    return this.issueTokensForUser(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async me(userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }

  private async authenticate(
    loginDto: LoginDto,
    requiredRole?: Role,
  ): Promise<AuthResponseDto> {
    const user = await this.findUserForLogin(loginDto.email);
    const passwordIsValid = await this.passwordService.compare(
      loginDto.password,
      user.PasswordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (requiredRole && user.Role !== requiredRole) {
      throw new ForbiddenException('Access denied');
    }

    return this.issueTokensForUser(user);
  }

  private async issueTokensForUser(user: User): Promise<AuthResponseDto> {
    const accessToken = await this.tokenService.signAccessToken({
      sub: user.Id,
      email: user.Email,
      username: user.UserName,
      role: user.Role,
    });
    const refreshToken = await this.tokenService.signRefreshToken({
      sub: user.Id,
    });

    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    const refreshTokenExpiresAt = this.calculateRefreshTokenExpiresAt();

    await this.usersService.setRefreshToken(
      user.Id,
      refreshTokenHash,
      refreshTokenExpiresAt,
    );

    const currentUser = await this.usersService.findById(user.Id);

    return {
      user: currentUser,
      accessToken,
      refreshToken,
    };
  }

  private async findUserForLogin(email: string): Promise<User> {
    const user = await this.usersService.findEntityByEmail(
      this.normalizeEmail(email),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async findUserForRefresh(payload: { sub: string }): Promise<User> {
    const user = await this.usersService.findEntityById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  private async assertRefreshTokenMatches(
    user: User,
    refreshToken: string,
  ): Promise<void> {
    if (!user.RefreshTokenHash || !user.RefreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (user.RefreshTokenExpiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const matches = await this.passwordService.compare(
      refreshToken,
      user.RefreshTokenHash,
    );

    if (!matches) {
      throw new UnauthorizedException('Refresh token is invalid');
    }
  }

  private calculateRefreshTokenExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    return expiresAt;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
