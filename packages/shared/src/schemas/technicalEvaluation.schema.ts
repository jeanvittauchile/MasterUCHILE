import { z } from 'zod';
import { isValidTimeInput } from '../validation/time';
import { TECHNICAL_EVALUATION_TYPES } from '../domain/technicalEvaluation';

const attemptSchema = z.object({
  numeroIntento: z.number().int().positive(),
  tiempo: z.string().trim().refine(isValidTimeInput, { message: 'Formato de tiempo inválido (00:00.0)' }),
  brazadas: z.number().int().min(0).optional(),
  patadas: z.number().int().min(0).optional(),
  subacuatico: z.number().int().min(0).optional(),
});

export const createTechnicalEvaluationSchema = z.object({
  tipo: z.enum(TECHNICAL_EVALUATION_TYPES),
  fecha: z.string().date().optional(),
  nota: z.string().trim().optional(),
  attempts: z.array(attemptSchema).min(1, 'Registra al menos un intento'),
});
export type CreateTechnicalEvaluationInput = z.infer<typeof createTechnicalEvaluationSchema>;
