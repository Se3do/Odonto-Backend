import { Injectable } from '@nestjs/common';
import { Difficulty } from '@prisma/client';

const BASE_XP: Record<Difficulty, number> = {
  [Difficulty.EASY]: 10,
  [Difficulty.MEDIUM]: 20,
  [Difficulty.HARD]: 30,
};

@Injectable()
export class XpService {
  calculate(score: number, difficulty: Difficulty): number {
    const base = BASE_XP[difficulty];
    return Math.floor(base * (score / 100));
  }
}
