import { z } from 'zod';
import { isValidTimeInput } from '../validation/time';
import { TECHNICAL_EVALUATION_TYPES, TECHNICAL_EVALUATION_STROKES, TURN_COMBINATIONS } from '../domain/technicalEvaluation';

const attemptSchema = z.object({
  numeroIntento: z.number().int().positive(),
  tiempo: z.string().trim().refine(isValidTimeInput, { message: 'Formato de tiempo inválido (00:00.0)' }),
  brazadas: z.number().int().min(0).optional(),
  patadas: z.number().int().min(0).optional(),
  subacuatico: z.number().int().min(0).optional(),
});

function checkEstiloCombinacion(
  data: { tipo: 'viraje' | 'salida'; estilo?: string; combinacion?: string },
  ctx: z.RefinementCtx,
) {
  if (data.tipo === 'salida') {
    if (!data.estilo) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona el estilo de la salida', path: ['estilo'] });
    }
    if (data.combinacion) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La salida no lleva combinación de viraje', path: ['combinacion'] });
    }
  } else {
    if (!data.combinacion) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona la combinación del viraje', path: ['combinacion'] });
    }
    if (data.estilo) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El viraje no lleva estilo de salida', path: ['estilo'] });
    }
  }
}

export const createTechnicalEvaluationSchema = z
  .object({
    tipo: z.enum(TECHNICAL_EVALUATION_TYPES),
    estilo: z.enum(TECHNICAL_EVALUATION_STROKES).optional(),
    combinacion: z.enum(TURN_COMBINATIONS).optional(),
    fecha: z.string().date().optional(),
    nota: z.string().trim().optional(),
    attempts: z.array(attemptSchema).min(1, 'Registra al menos un intento'),
  })
  .superRefine(checkEstiloCombinacion);
export type CreateTechnicalEvaluationInput = z.infer<typeof createTechnicalEvaluationSchema>;

export const createBulkTechnicalEvaluationSchema = z
  .object({
    tipo: z.enum(TECHNICAL_EVALUATION_TYPES),
    estilo: z.enum(TECHNICAL_EVALUATION_STROKES).optional(),
    combinacion: z.enum(TURN_COMBINATIONS).optional(),
    fecha: z.string().date().optional(),
    entries: z
      .array(
        z.object({
          swimmerId: z.string().uuid(),
          nota: z.string().trim().optional(),
          attempts: z.array(attemptSchema).min(1, 'Registra al menos un intento'),
        }),
      )
      .min(1, 'Selecciona al menos un nadador'),
  })
  .superRefine(checkEstiloCombinacion);
export type CreateBulkTechnicalEvaluationInput = z.infer<typeof createBulkTechnicalEvaluationSchema>;
