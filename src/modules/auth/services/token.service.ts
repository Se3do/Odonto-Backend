import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ACCESS_TOKEN_SUBJECT, REFRESH_TOKEN_SUBJECT } from '../auth.constants';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenType: 'refresh';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get accessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  private get accessExpiresIn(): JwtSignOptions['expiresIn'] {
    return this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
      'JWT_ACCESS_EXPIRES_IN',
    );
  }

  private get refreshExpiresIn(): JwtSignOptions['expiresIn'] {
    return this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }

  signAccessToken(
    payload: Omit<AccessTokenPayload, 'tokenType'>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: ACCESS_TOKEN_SUBJECT } as AccessTokenPayload,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    );
  }

  signRefreshToken(
    payload: Omit<RefreshTokenPayload, 'tokenType'>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: REFRESH_TOKEN_SUBJECT } as RefreshTokenPayload,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
      token,
      {
        secret: this.accessSecret,
      },
    );

    if (payload.tokenType !== ACCESS_TOKEN_SUBJECT) {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload;
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
      token,
      {
        secret: this.refreshSecret,
      },
    );

    if (payload.tokenType !== REFRESH_TOKEN_SUBJECT) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }
}
