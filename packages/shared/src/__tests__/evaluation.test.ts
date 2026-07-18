import { averageEvaluationScore, isValidScore } from '../domain/evaluation';

describe('evaluation', () => {
  it('averages the 6 criteria, rounded to 1 decimal', () => {
    const scores = { libre: 8.5, espalda: 7.8, pecho: 6.9, mariposa: 7.2, virajes: 8.0, salidas: 7.5 };
    expect(averageEvaluationScore(scores)).toBe(7.7);
  });

  it('accepts half-point steps within 1-10', () => {
    expect(isValidScore(7.5)).toBe(true);
    expect(isValidScore(1)).toBe(true);
    expect(isValidScore(10)).toBe(true);
  });

  it('rejects out-of-range or non-half-step scores', () => {
    expect(isValidScore(0.5)).toBe(false);
    expect(isValidScore(10.5)).toBe(false);
    expect(isValidScore(7.3)).toBe(false);
  });
});
