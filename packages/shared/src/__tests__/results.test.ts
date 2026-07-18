import { computePersonalBestId, isNewPersonalBest } from '../domain/results';

describe('personal best', () => {
  it('a first-ever time is always a PB', () => {
    expect(isNewPersonalBest([], 6240)).toBe(true);
  });

  it('a faster (lower) time is a new PB', () => {
    expect(isNewPersonalBest([6360, 6480], 6240)).toBe(true);
  });

  it('a slower time is not a PB', () => {
    expect(isNewPersonalBest([6240], 6360)).toBe(false);
  });

  it('picks the lowest tiempo_centesimas as the PB id among a full result set', () => {
    const results = [
      { id: 'a', tiempoCentesimas: 6360 },
      { id: 'b', tiempoCentesimas: 6240 },
      { id: 'c', tiempoCentesimas: 6480 },
    ];
    expect(computePersonalBestId(results)).toBe('b');
  });

  it('returns null for an empty set', () => {
    expect(computePersonalBestId([])).toBeNull();
  });
});
