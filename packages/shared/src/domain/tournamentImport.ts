/**
 * Parser de líneas de calendario de torneos pegadas a mano por el coach, ej.:
 *   "28 de Marzo : XXII COPPA ITALIA MASTER"
 *   "24-26 Julio:  Nacional Master Invierno FECHIDA (Prioritario)."
 *   "6-9 Enero 2027 XXI NACIONAL MÁSTER FCHMN (Prioritario )"
 * Formato tolerado: "DD[-DD] [de] <mes> [AAAA][:] <nombre> [(prioritario...)]" — el separador ":"
 * es opcional (algunas líneas no lo traen), el año es opcional (se usa `defaultYear` si falta), y el
 * rango "DD-DD" es opcional (torneos de un solo día no lo llevan).
 */

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const LINE_RE =
  /^\s*(\d{1,2})\s*(?:-\s*(\d{1,2}))?\s*(?:de\s+)?([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\.?\s*(\d{4})?\s*:?\s*(.*)$/;

const PRIORITY_RE = /\(\s*prioritario[^)]*\)/gi;

export interface ParsedTournamentLine {
  nombre: string;
  fecha: string; // YYYY-MM-DD
  fechaFin: string | null;
  prioritario: boolean;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Devuelve null si la línea no calza con el formato esperado (fila a reportar como rechazada). */
export function parseTournamentImportLine(rawLine: string, defaultYear: number): ParsedTournamentLine | null {
  const line = rawLine.trim();
  if (!line) return null;

  const match = line.match(LINE_RE);
  if (!match) return null;

  const [, startDayStr, endDayStr, monthWord, yearStr, rest] = match;
  const month = MONTHS[monthWord.trim().toLowerCase()];
  if (!month) return null;

  const startDay = Number(startDayStr);
  if (startDay < 1 || startDay > 31) return null;

  const year = yearStr ? Number(yearStr) : defaultYear;
  const fecha = `${year}-${pad2(month)}-${pad2(startDay)}`;

  let fechaFin: string | null = null;
  if (endDayStr) {
    const endDay = Number(endDayStr);
    if (endDay < 1 || endDay > 31) return null;
    fechaFin = `${year}-${pad2(month)}-${pad2(endDay)}`;
  }

  const prioritario = PRIORITY_RE.test(rest);
  PRIORITY_RE.lastIndex = 0; // regex global: resetear estado entre llamadas
  const nombre = rest
    .replace(PRIORITY_RE, '')
    .replace(/\s*\.\s*$/, '')
    .trim();
  if (!nombre) return null;

  return { nombre, fecha, fechaFin, prioritario };
}
