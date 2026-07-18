import { formatCentiseconds, isValidTimeInput, parseTimeToCentiseconds } from '../validation/time';

describe('time parsing/formatting', () => {
  it('parses m:ss.d into centiseconds', () => {
    expect(parseTimeToCentiseconds('1:02.4')).toBe(6240);
  });

  it('parses ss.d (no minutes) into centiseconds', () => {
    expect(parseTimeToCentiseconds('29.8')).toBe(2980);
  });

  it('parses a hundredths-precision input', () => {
    expect(parseTimeToCentiseconds('1:02.45')).toBe(6245);
  });

  it('rejects seconds >= 60 and empty/garbage input', () => {
    expect(parseTimeToCentiseconds('1:60.0')).toBeNull();
    expect(parseTimeToCentiseconds('')).toBeNull();
    expect(parseTimeToCentiseconds('abc')).toBeNull();
  });

  it('isValidTimeInput mirrors parseTimeToCentiseconds', () => {
    expect(isValidTimeInput('1:02.4')).toBe(true);
    expect(isValidTimeInput('bad')).toBe(false);
  });

  it('formats centiseconds back to the display format, round-tripping the prototype examples', () => {
    expect(formatCentiseconds(6240)).toBe('1:02.4');
    expect(formatCentiseconds(2980)).toBe('29.8');
  });
});
