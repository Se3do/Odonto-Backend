import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_SUBJECT,
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
  DEFAULT_ACCESS_TOKEN_SECRET,
  DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
  DEFAULT_REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_SUBJECT,
} from '../auth.constants';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenType: 'refresh';
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(
    payload: Omit<AccessTokenPayload, 'tokenType'>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: ACCESS_TOKEN_SUBJECT } as AccessTokenPayload,
      {
        secret: DEFAULT_ACCESS_TOKEN_SECRET,
        expiresIn:
          DEFAULT_ACCESS_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );
  }

  signRefreshToken(
    payload: Omit<RefreshTokenPayload, 'tokenType'>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: REFRESH_TOKEN_SUBJECT } as RefreshTokenPayload,
      {
        secret: DEFAULT_REFRESH_TOKEN_SECRET,
        expiresIn:
          DEFAULT_REFRESH_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
      token,
      {
        secret: DEFAULT_ACCESS_TOKEN_SECRET,
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
        secret: DEFAULT_REFRESH_TOKEN_SECRET,
      },
    );

    if (payload.tokenType !== REFRESH_TOKEN_SUBJECT) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }
}
