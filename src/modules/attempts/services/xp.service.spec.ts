import { Difficulty } from '@prisma/client';
import { XpService } from './xp.service';

describe('XpService', () => {
  let service: XpService;

  beforeEach(() => {
    service = new XpService();
  });

  it('gives base XP at a perfect score', () => {
    expect(service.calculate(100, Difficulty.EASY)).toBe(10);
    expect(service.calculate(100, Difficulty.MEDIUM)).toBe(20);
    expect(service.calculate(100, Difficulty.HARD)).toBe(30);
  });

  it('gives zero XP at a zero score', () => {
    expect(service.calculate(0, Difficulty.EASY)).toBe(0);
    expect(service.calculate(0, Difficulty.MEDIUM)).toBe(0);
    expect(service.calculate(0, Difficulty.HARD)).toBe(0);
  });

  it('floors partial scores', () => {
    expect(service.calculate(50, Difficulty.MEDIUM)).toBe(10); // 20 * 0.5
    expect(service.calculate(33, Difficulty.HARD)).toBe(9); // 30 * 0.33
  });
});
