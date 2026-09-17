import { Difficulty } from '@prisma/client';
import { AttemptScoringService } from './attempt-scoring.service';

describe('AttemptScoringService', () => {
  let service: AttemptScoringService;

  beforeEach(() => {
    service = new AttemptScoringService();
  });

  const correctDiagnosis = 'diag-1';
  const wrongDiagnosis = 'diag-2';
  const allTests = ['test-1', 'test-2'];
  const correctTests = ['test-1'];
  const allTreatments = ['treat-1', 'treat-2'];
  const correctTreatments = ['treat-1'];

  it('scores 100 for a perfect answer', () => {
    const result = service.score(
      correctDiagnosis,
      correctDiagnosis,
      correctTests,
      correctTests,
      allTests,
      correctTreatments,
      correctTreatments,
      allTreatments,
      Difficulty.MEDIUM,
    );

    expect(result.diagnosisCorrect).toBe(true);
    expect(result.finalScore).toBe(100);
  });

  it('scores 0 for a fully wrong answer', () => {
    const result = service.score(
      wrongDiagnosis,
      correctDiagnosis,
      ['test-2'],
      correctTests,
      allTests,
      ['treat-2'],
      correctTreatments,
      allTreatments,
      Difficulty.MEDIUM,
    );

    expect(result.diagnosisCorrect).toBe(false);
    expect(result.finalScore).toBe(0);
  });

  it('gives partial credit: correct diagnosis, wrong treatment', () => {
    const result = service.score(
      correctDiagnosis,
      correctDiagnosis,
      correctTests,
      correctTests,
      allTests,
      ['treat-2'],
      correctTreatments,
      allTreatments,
      Difficulty.MEDIUM,
    );

    // diagnosis 40 + tests 30 (correctly ordered), treatments 0 => 70
    expect(result.finalScore).toBe(70);
  });

  it('marks each test and treatment as correct/incorrect', () => {
    const result = service.score(
      correctDiagnosis,
      correctDiagnosis,
      ['test-1', 'test-2'],
      ['test-1'],
      allTests,
      ['treat-1'],
      ['treat-1', 'treat-2'],
      allTreatments,
      Difficulty.MEDIUM,
    );

    expect(result.testResults).toEqual([
      { testId: 'test-1', correct: true },
      { testId: 'test-2', correct: false },
    ]);
    expect(result.treatmentResults).toEqual([
      { treatmentId: 'treat-1', correct: true },
      { treatmentId: 'treat-2', correct: false },
    ]);
  });

  it('handles empty test/treatment pools (diagnosis-only weight)', () => {
    const result = service.score(
      correctDiagnosis,
      correctDiagnosis,
      [],
      [],
      [],
      [],
      [],
      [],
      Difficulty.HARD,
    );

    expect(result.finalScore).toBe(40);
  });

  it('applies the same weights across all difficulties', () => {
    const perfect = (d: Difficulty) =>
      service.score(
        correctDiagnosis,
        correctDiagnosis,
        correctTests,
        correctTests,
        allTests,
        correctTreatments,
        correctTreatments,
        allTreatments,
        d,
      ).finalScore;

    expect(perfect(Difficulty.EASY)).toBe(100);
    expect(perfect(Difficulty.MEDIUM)).toBe(100);
    expect(perfect(Difficulty.HARD)).toBe(100);
  });
});