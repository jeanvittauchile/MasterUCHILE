export const TECHNICAL_EVALUATION_TYPES = ['viraje', 'salida'] as const;
export type TechnicalEvaluationType = (typeof TECHNICAL_EVALUATION_TYPES)[number];

export const TECHNICAL_EVALUATION_METRICS = ['brazadas', 'patadas', 'subacuatico'] as const;
export type TechnicalEvaluationMetric = (typeof TECHNICAL_EVALUATION_METRICS)[number];

export interface TechnicalEvaluationTypeConfig {
  label: string;
  tiempoLabel: string;
  metrics: TechnicalEvaluationMetric[];
}

export const TECHNICAL_EVALUATION_CONFIG: Record<TechnicalEvaluationType, TechnicalEvaluationTypeConfig> = {
  viraje: {
    label: 'Viraje',
    tiempoLabel: 'Tiempo total (5 → 15 m)',
    metrics: ['brazadas', 'patadas'],
  },
  salida: {
    label: 'Salida',
    tiempoLabel: 'Tiempo total (reacción → 15 m)',
    metrics: ['subacuatico', 'brazadas'],
  },
};

export const TECHNICAL_EVALUATION_METRIC_LABELS: Record<TechnicalEvaluationMetric, string> = {
  brazadas: 'Brazadas',
  patadas: 'Patadas',
  subacuatico: 'Mov. subacuáticos',
};

export const TECHNICAL_EVALUATION_STROKES = ['crol', 'espalda', 'pecho', 'mariposa'] as const;
export type TechnicalEvaluationStroke = (typeof TECHNICAL_EVALUATION_STROKES)[number];

export const TECHNICAL_EVALUATION_STROKE_LABELS: Record<TechnicalEvaluationStroke, string> = {
  crol: 'Crol',
  espalda: 'Espalda',
  pecho: 'Pecho',
  mariposa: 'Mariposa',
};

export const TURN_COMBINATIONS = [
  'crol_crol',
  'espalda_espalda',
  'mariposa_mariposa',
  'pecho_pecho',
  'mariposa_espalda',
  'espalda_pecho',
  'pecho_crol',
] as const;
export type TurnCombination = (typeof TURN_COMBINATIONS)[number];

export const TURN_COMBINATION_LABELS: Record<TurnCombination, string> = {
  crol_crol: 'Crol → Crol',
  espalda_espalda: 'Espalda → Espalda',
  mariposa_mariposa: 'Mariposa → Mariposa',
  pecho_pecho: 'Pecho → Pecho',
  mariposa_espalda: 'Mariposa → Espalda',
  espalda_pecho: 'Espalda → Pecho',
  pecho_crol: 'Pecho → Crol',
};

/** Mejor intento = tiempo más bajo (mismo criterio que Promesas-Chile: "tiempo más bajo = mejor salida/viraje"). */
export function bestAttempt<T extends { tiempo_centesimas: number }>(attempts: T[]): T | null {
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => (a.tiempo_centesimas < best.tiempo_centesimas ? a : best));
}
