import { z } from 'zod';
import { EVALUATION_CRITERIA, isValidScore } from '../domain/evaluation';

const scoreField = z.number().refine(isValidScore, { message: 'El puntaje debe ser 1-10 en pasos de 0.5' });

const scoresShape = Object.fromEntries(EVALUATION_CRITERIA.map((c) => [c, scoreField])) as Record<
  (typeof EVALUATION_CRITERIA)[number],
  typeof scoreField
>;

export const createEvaluationSchema = z.object({
  fecha: z.string().date().optional(),
  scores: z.object(scoresShape),
  nota: z.string().trim().optional(),
});
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
