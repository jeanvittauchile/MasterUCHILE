/** Acepta teléfonos chilenos con o sin +56, con espacios opcionales: "+56 9 8123 4567", "912345678". */
const PHONE_RE = /^(\+?56)?\s*9?\s*\d{4}\s*\d{4}$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim());
}
