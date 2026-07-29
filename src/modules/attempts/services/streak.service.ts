import { Injectable } from '@nestjs/common';
import { StreakUpdate } from '../types/attempt.types';

@Injectable()
export class StreakService {
  calculate(
    lastCompletedDate: Date | null,
    currentStreak: number,
  ): StreakUpdate {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak: number;

    if (lastCompletedDate === null) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastCompletedDate);
      lastDate.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === today.getTime()) {
        newStreak = currentStreak;
      } else if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    return {
      currentStreak: newStreak,
      longestStreak: 0,
      lastCompletedDate: today,
    };
  }
}
