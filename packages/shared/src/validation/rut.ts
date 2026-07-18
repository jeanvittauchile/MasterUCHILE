/**
 * Chilean RUT (Rol Único Tributario) validation and formatting.
 * Check digit uses módulo 11 over the digit sequence weighted 2..7 cyclically.
 */

/** Strips dots/dashes/spaces, uppercases the check digit. "12.345.678-9" -> "123456789" */
export function normalizeRut(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^0-9K]/g, '');
}

/** Computes the expected check digit ('0'-'9' or 'K') for a body of digits (no check digit included). */
export function computeCheckDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/** Validates a RUT string in any common format (with/without dots and dash). */
export function isValidRut(raw: string): boolean {
  const normalized = normalizeRut(raw);
  if (normalized.length < 2) return false;
  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeCheckDigit(body) === dv;
}

/** Formats a normalized RUT ("123456789") as "12.345.678-9". Returns input unchanged if too short. */
export function formatRut(raw: string): string {
  const normalized = normalizeRut(raw);
  if (normalized.length < 2) return raw;
  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

/** Detects whether a login identity string looks like a RUT (vs. a name) — 7 to 9 digits plus a check char. */
export function looksLikeRut(raw: string): boolean {
  const normalized = normalizeRut(raw);
  return /^\d{7,9}[0-9K]$/.test(normalized);
}
