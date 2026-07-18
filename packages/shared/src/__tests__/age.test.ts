import { ageForSeason, categoryForAge, categoryForBirthDate } from '../domain/age';

describe('age & category', () => {
  it('computes season-cutoff age (ignores month/day, like the prototype)', () => {
    expect(ageForSeason('1993-05-14', 2026)).toBe(33);
    expect(ageForSeason('1988-11-02', 2026)).toBe(38);
  });

  it('returns null for an unparseable date', () => {
    expect(ageForSeason('not-a-date', 2026)).toBeNull();
  });

  it('buckets ages into 5-year bands starting at 30 for the letter, floor 25', () => {
    expect(categoryForAge(33)).toEqual({ letter: 'A', bandStart: 30, bandEnd: 34, label: 'Máster A · 30–34' });
    expect(categoryForAge(38)).toEqual({ letter: 'B', bandStart: 35, bandEnd: 39, label: 'Máster B · 35–39' });
    expect(categoryForAge(42)).toEqual({ letter: 'C', bandStart: 40, bandEnd: 44, label: 'Máster C · 40–44' });
  });

  it('clamps ages below the letter base to band A (prototype behavior for <30)', () => {
    expect(categoryForAge(27)).toEqual({ letter: 'A', bandStart: 25, bandEnd: 29, label: 'Máster A · 25–29' });
  });

  it('combines birth date + season into a category', () => {
    expect(categoryForBirthDate('1993-05-14', { seasonYear: 2026 })?.label).toBe('Máster A · 30–34');
  });
});
