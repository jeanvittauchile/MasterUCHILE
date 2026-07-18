/**
 * Edad y categoría máster son SIEMPRE calculadas desde fecha_nacimiento, nunca columnas persistidas.
 * Regla replicada 1:1 desde el prototipo de referencia (ageFrom/catFrom): corte al 31 de diciembre del
 * año de temporada (edad que se cumple durante el año, no la edad exacta a la fecha de hoy), bandas
 * máster de 5 años. Pendiente de confirmar con la federación (ver Handoff §10) — por eso los límites de
 * banda son parámetros con default, no constantes hardcodeadas en cada call site.
 */

export interface CategoryBandOptions {
  /** Año de temporada usado como corte (31-dic). Default: año actual. */
  seasonYear?: number;
  /** Edad mínima de la primera banda mostrada (el prototipo usa 25). */
  minBandStart?: number;
  /** Edad donde empieza la letra "A" (el prototipo usa 30: Máster A = 30-34). */
  letterBaseAge?: number;
}

export function ageForSeason(birthDate: string | Date, seasonYear = new Date().getFullYear()): number | null {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(d.getTime())) return null;
  return seasonYear - d.getFullYear();
}

export interface MasterCategory {
  letter: string;
  bandStart: number;
  bandEnd: number;
  label: string;
}

export function categoryForAge(age: number, options: CategoryBandOptions = {}): MasterCategory {
  const { minBandStart = 25, letterBaseAge = 30 } = options;
  const bandStart = Math.max(minBandStart, Math.floor(age / 5) * 5);
  const letterIndex = Math.max(0, (bandStart - letterBaseAge) / 5);
  const letter = String.fromCharCode(65 + letterIndex);
  const bandEnd = bandStart + 4;
  return { letter, bandStart, bandEnd, label: `Máster ${letter} · ${bandStart}–${bandEnd}` };
}

/** Combina ambos pasos: fecha de nacimiento -> categoría máster para la temporada dada. */
export function categoryForBirthDate(
  birthDate: string | Date,
  options: CategoryBandOptions = {},
): MasterCategory | null {
  const age = ageForSeason(birthDate, options.seasonYear);
  if (age == null) return null;
  return categoryForAge(age, options);
}
