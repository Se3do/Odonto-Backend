import { createHash, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  compareToken(token: string, hashedToken: string): boolean {
    const candidate = Buffer.from(this.hashToken(token), 'utf8');
    const stored = Buffer.from(hashedToken, 'utf8');
    if (candidate.length !== stored.length) {
      return false;
    }
    return timingSafeEqual(candidate, stored);
  }
}
