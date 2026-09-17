import { StreakService } from './streak.service';

describe('StreakService', () => {
  let service: StreakService;

  const dayOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  beforeEach(() => {
    service = new StreakService();
  });

  it('starts a streak of 1 on first completion', () => {
    const result = service.calculate(null, 0);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(0);
  });

  it('keeps the streak when completing again on the same day', () => {
    const result = service.calculate(dayOffset(0), 3);
    expect(result.currentStreak).toBe(3);
  });

  it('increments the streak on a consecutive-day completion', () => {
    const result = service.calculate(dayOffset(1), 3);
    expect(result.currentStreak).toBe(4);
  });

  it('resets the streak to 1 after a gap of more than a day', () => {
    const result = service.calculate(dayOffset(2), 5);
    expect(result.currentStreak).toBe(1);
  });
});
