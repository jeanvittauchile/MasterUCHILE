export const EVALUATION_CRITERIA = ['libre', 'espalda', 'pecho', 'mariposa', 'virajes', 'salidas'] as const;

export type EvaluationCriterion = (typeof EVALUATION_CRITERIA)[number];

export type EvaluationScores = Record<EvaluationCriterion, number>;

export function isValidScore(value: number): boolean {
  return value >= 1 && value <= 10 && Math.round(value * 2) === value * 2;
}

/** Promedio de los 6 criterios, redondeado a 1 decimal (igual que el prototipo: "Promedio X.X / 10"). */
export function averageEvaluationScore(scores: EvaluationScores): number {
  const values = EVALUATION_CRITERIA.map((criterion) => scores[criterion]);
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
