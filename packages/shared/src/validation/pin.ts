/** PIN de ingreso: exactamente 4 dígitos numéricos. */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Genera un PIN aleatorio de 4 dígitos (para altas/importación/restauración), 0000-9999 con padding.
 * Usa crypto.getRandomValues cuando está disponible (navegador/RN/Node 19+); si no, cae a Math.random.
 * El backend es responsable de nunca persistir este valor en texto plano (solo su hash).
 */
export function generatePin(): string {
  const cryptoObj = (globalThis as { crypto?: { getRandomValues: (arr: Uint32Array) => Uint32Array } })
    .crypto;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    return String(buf[0] % 10000).padStart(4, '0');
  }
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}
