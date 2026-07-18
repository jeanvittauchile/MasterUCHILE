/** Lógica pura de PB (personal best): el mínimo tiempo_centesimas por nadador+prueba. */

export interface TimedResult {
  id: string;
  tiempoCentesimas: number;
}

/** ¿Es `newTimeCentesimas` un nuevo PB frente a los tiempos existentes de esa prueba? */
export function isNewPersonalBest(existingCentiseconds: number[], newTimeCentesimas: number): boolean {
  if (existingCentiseconds.length === 0) return true;
  return newTimeCentesimas < Math.min(...existingCentiseconds);
}

/**
 * Dado el conjunto completo de resultados de un nadador para una prueba (incluyendo el nuevo registro),
 * devuelve el id del que debe quedar marcado es_pb=true. El resto debe des-marcarse.
 */
export function computePersonalBestId(results: TimedResult[]): string | null {
  if (results.length === 0) return null;
  return results.reduce((best, r) => (r.tiempoCentesimas < best.tiempoCentesimas ? r : best)).id;
}
