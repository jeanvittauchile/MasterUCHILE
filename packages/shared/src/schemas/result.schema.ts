import { z } from 'zod';
import { isValidTimeInput } from '../validation/time';

export const createResultSchema = z.object({
  prueba: z.string().trim().min(1, 'Selecciona una prueba'),
  tiempo: z.string().trim().refine(isValidTimeInput, { message: 'Formato de tiempo inválido (00:00.0)' }),
  splitDist: z.enum(['25', '50']).optional(),
  parciales: z.array(z.number().positive()).optional(),
  fecha: z.string().date().optional(),
});
export type CreateResultInput = z.infer<typeof createResultSchema>;
