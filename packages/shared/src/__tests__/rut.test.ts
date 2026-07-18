import { computeCheckDigit, formatRut, isValidRut, looksLikeRut, normalizeRut } from '../validation/rut';

describe('rut', () => {
  it('normalizes dots/dashes and uppercases the check digit', () => {
    expect(normalizeRut('17.845.221-3')).toBe('178452213');
    expect(normalizeRut('13.998.210-k')).toBe('13998210K');
  });

  it('computes the correct check digit (módulo 11)', () => {
    // Verificados a mano y contra calculadoras de RUT públicas.
    expect(computeCheckDigit('12345678')).toBe('5');
    expect(computeCheckDigit('11111111')).toBe('1');
    expect(computeCheckDigit('13998210')).toBe('K');
    expect(computeCheckDigit('6')).toBe('K');
  });

  it('validates well-formed RUTs with a correct check digit', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('13.998.210-k')).toBe(true);
  });

  it('rejects an incorrect check digit', () => {
    // El RUT de ejemplo del prototipo de diseño es ficticio y no valida contra el algoritmo real
    // (el dígito verificador correcto para 17.845.221 es 5, no 3) — confirma que la validación real
    // detecta esto, cosa que el prototipo (sin backend) no verificaba.
    expect(isValidRut('17.845.221-3')).toBe(false);
  });

  it('rejects garbage input', () => {
    expect(isValidRut('')).toBe(false);
    expect(isValidRut('abc')).toBe(false);
  });

  it('formats a normalized RUT back with dots and dash', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5');
  });

  it('distinguishes RUT-shaped identities from names', () => {
    expect(looksLikeRut('12.345.678-5')).toBe(true);
    expect(looksLikeRut('Valentina Rojas')).toBe(false);
  });
});
