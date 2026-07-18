/**
 * Formato estándar de tiempos de natación: "m:ss.d" (minutos opcionales) o "ss.d".
 * Se almacena internamente en centésimas de segundo (entero) para ordenar/comparar sin errores de punto flotante.
 */

const TIME_RE = /^(?:(\d{1,3}):)?(\d{1,2})(?:[.,](\d{1,2}))?$/;

/** Parsea "1:02.4", "01:02.40" o "29.8" a centésimas de segundo. Devuelve null si el formato es inválido. */
export function parseTimeToCentiseconds(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const match = s.match(TIME_RE);
  if (!match) return null;
  const [, minutesRaw, secondsRaw, fracRaw] = match;
  const minutes = minutesRaw ? parseInt(minutesRaw, 10) : 0;
  const seconds = parseInt(secondsRaw, 10);
  if (seconds >= 60) return null;
  const centisecondsFraction = fracRaw ? (fracRaw.length === 1 ? Number(fracRaw) * 10 : Number(fracRaw)) : 0;
  const total = (minutes * 60 + seconds) * 100 + centisecondsFraction;
  return total > 0 ? total : null;
}

export function isValidTimeInput(input: string): boolean {
  return parseTimeToCentiseconds(input) !== null;
}

/** Formatea centésimas a "m:ss.d" (con minutos) o "ss.d" (sin minutos), igual que el prototipo. */
export function formatCentiseconds(centiseconds: number): string {
  const tenths = Math.round(centiseconds / 10);
  const totalSeconds = Math.floor(tenths / 10);
  const decimal = tenths % 10;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const secondsStr = minutes > 0 ? String(seconds).padStart(2, '0') : String(seconds);
  return minutes > 0 ? `${minutes}:${secondsStr}.${decimal}` : `${secondsStr}.${decimal}`;
}

/** Centésimas -> segundos con un decimal, para ejes de gráficos ("El tiempo baja = mejora"). */
export function centisecondsToSeconds(centiseconds: number): number {
  return Math.round(centiseconds / 10) / 10;
}
