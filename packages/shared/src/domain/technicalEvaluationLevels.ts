import type { TechnicalEvaluationStroke, TurnCombination } from './technicalEvaluation';

export const EVALUATION_LEVELS = ['AR', 'A', 'I', 'P'] as const; // orden: mejor → peor
export type EvaluationLevel = (typeof EVALUATION_LEVELS)[number];

export const EVALUATION_LEVEL_LABELS: Record<EvaluationLevel, string> = {
  AR: 'Alto Rendimiento',
  A: 'Avanzado',
  I: 'Intermedio',
  P: 'Principiante',
};

export interface LevelRange {
  min: number;
  max: number;
}

interface StrokeLevelEntry {
  salidaTiempo: LevelRange;
  virajeTiempo: LevelRange;
  /**
   * Movimientos subacuáticos ("Pat.Sub" en la lámina de referencia): un único rango por nivel que
   * se usa como métrica "subacuatico" en evaluaciones de salida y como "patadas" en evaluaciones
   * de viraje (la lámina no distingue el rango entre ambas disciplinas). null = pecho, que exige
   * técnica fija en vez de un rango (ver PECHO_TECNICA_FIJA).
   */
  patSub: LevelRange | null;
  /** Brazadas ("Braz." en la lámina): mismo rango aplica a salida y a viraje. null = pecho. */
  brazadas: LevelRange | null;
}

/** Tabla de referencia técnica de salidas y virajes (lámina del club). Todos los tiempos en segundos. */
export const STROKE_LEVELS: Record<TechnicalEvaluationStroke, Record<EvaluationLevel, StrokeLevelEntry>> = {
  crol: {
    P: { salidaTiempo: { min: 8.5, max: 10.5 }, virajeTiempo: { min: 12, max: 15 }, patSub: { min: 2, max: 4 }, brazadas: { min: 5, max: 7 } },
    I: { salidaTiempo: { min: 7, max: 8.5 }, virajeTiempo: { min: 10, max: 12 }, patSub: { min: 4, max: 6 }, brazadas: { min: 4, max: 6 } },
    A: { salidaTiempo: { min: 6, max: 7 }, virajeTiempo: { min: 8.5, max: 10 }, patSub: { min: 6, max: 8 }, brazadas: { min: 3, max: 5 } },
    AR: { salidaTiempo: { min: 5.2, max: 6 }, virajeTiempo: { min: 7.5, max: 8.5 }, patSub: { min: 6, max: 10 }, brazadas: { min: 2, max: 4 } },
  },
  espalda: {
    P: { salidaTiempo: { min: 8.8, max: 10.8 }, virajeTiempo: { min: 13, max: 16 }, patSub: { min: 2, max: 4 }, brazadas: { min: 5, max: 7 } },
    I: { salidaTiempo: { min: 7.2, max: 8.8 }, virajeTiempo: { min: 10.5, max: 12.5 }, patSub: { min: 4, max: 6 }, brazadas: { min: 4, max: 6 } },
    A: { salidaTiempo: { min: 6.2, max: 7.2 }, virajeTiempo: { min: 9, max: 10.5 }, patSub: { min: 6, max: 8 }, brazadas: { min: 3, max: 5 } },
    AR: { salidaTiempo: { min: 5.4, max: 6.2 }, virajeTiempo: { min: 8, max: 9 }, patSub: { min: 8, max: 12 }, brazadas: { min: 2, max: 4 } },
  },
  pecho: {
    P: { salidaTiempo: { min: 9, max: 11 }, virajeTiempo: { min: 15, max: 18 }, patSub: null, brazadas: null },
    I: { salidaTiempo: { min: 7.8, max: 9 }, virajeTiempo: { min: 12.5, max: 15 }, patSub: null, brazadas: null },
    A: { salidaTiempo: { min: 6.8, max: 7.8 }, virajeTiempo: { min: 11, max: 12.5 }, patSub: null, brazadas: null },
    AR: { salidaTiempo: { min: 5.7, max: 6.8 }, virajeTiempo: { min: 9.5, max: 11 }, patSub: null, brazadas: null },
  },
  mariposa: {
    P: { salidaTiempo: { min: 8.5, max: 10.5 }, virajeTiempo: { min: 13, max: 16 }, patSub: { min: 2, max: 4 }, brazadas: { min: 4, max: 6 } },
    I: { salidaTiempo: { min: 7, max: 8.5 }, virajeTiempo: { min: 10.5, max: 12.5 }, patSub: { min: 4, max: 6 }, brazadas: { min: 3, max: 5 } },
    A: { salidaTiempo: { min: 6, max: 7 }, virajeTiempo: { min: 9, max: 10.5 }, patSub: { min: 6, max: 8 }, brazadas: { min: 2, max: 4 } },
    AR: { salidaTiempo: { min: 5.2, max: 6 }, virajeTiempo: { min: 8, max: 9 }, patSub: { min: 6, max: 10 }, brazadas: { min: 2, max: 3 } },
  },
};

/** Pecho no clasifica por patadas/brazadas: exige técnica fija en todos los niveles. */
export const PECHO_TECNICA_FIJA = { patSub: '1 delfín + 1 pecho', brazadas: '1' };

/** Virajes de combinación entre estilos distintos: solo rango de tiempo total (sin desglose de patadas/brazadas). */
export const TURN_TRANSITION_TIME_LEVELS: Record<
  'mariposa_espalda' | 'espalda_pecho' | 'pecho_crol',
  Record<EvaluationLevel, LevelRange>
> = {
  mariposa_espalda: { AR: { min: 7.8, max: 8.8 }, A: { min: 8.8, max: 10 }, I: { min: 10, max: 11.5 }, P: { min: 11.5, max: 13.5 } },
  espalda_pecho: { AR: { min: 8.5, max: 9.5 }, A: { min: 9.5, max: 11 }, I: { min: 11, max: 12.5 }, P: { min: 12.5, max: 15 } },
  pecho_crol: { AR: { min: 8, max: 9 }, A: { min: 9, max: 10.5 }, I: { min: 10.5, max: 12 }, P: { min: 12, max: 14.5 } },
};

const STROKE_BY_SAME_STROKE_COMBO: Partial<Record<TurnCombination, TechnicalEvaluationStroke>> = {
  crol_crol: 'crol',
  espalda_espalda: 'espalda',
  pecho_pecho: 'pecho',
  mariposa_mariposa: 'mariposa',
};

function levelForRange(ranges: Record<EvaluationLevel, LevelRange>, value: number): EvaluationLevel {
  for (const level of EVALUATION_LEVELS) {
    if (value <= ranges[level].max) return level;
  }
  return 'P'; // más lento que el rango de referencia: se muestra como nivel base
}

/** Nivel de salida según el mejor tiempo (segundos) registrado para un estilo. */
export function levelForSalida(estilo: TechnicalEvaluationStroke, tiempoSegundos: number): EvaluationLevel {
  const ranges = Object.fromEntries(
    EVALUATION_LEVELS.map((level) => [level, STROKE_LEVELS[estilo][level].salidaTiempo]),
  ) as Record<EvaluationLevel, LevelRange>;
  return levelForRange(ranges, tiempoSegundos);
}

/** Nivel de viraje según el mejor tiempo (segundos) registrado para una combinación de estilos. */
export function levelForViraje(combinacion: TurnCombination, tiempoSegundos: number): EvaluationLevel {
  const sameStroke = STROKE_BY_SAME_STROKE_COMBO[combinacion];
  const ranges = sameStroke
    ? (Object.fromEntries(
        EVALUATION_LEVELS.map((level) => [level, STROKE_LEVELS[sameStroke][level].virajeTiempo]),
      ) as Record<EvaluationLevel, LevelRange>)
    : TURN_TRANSITION_TIME_LEVELS[combinacion as 'mariposa_espalda' | 'espalda_pecho' | 'pecho_crol'];
  if (!ranges) throw new Error(`Sin tabla de referencia para la combinación ${combinacion}`);
  return levelForRange(ranges, tiempoSegundos);
}
