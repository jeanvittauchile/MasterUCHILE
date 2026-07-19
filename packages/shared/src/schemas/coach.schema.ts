import { z } from 'zod';
import { isValidRut } from '../validation/rut';

export const createCoachSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  rut: z.string().trim().refine(isValidRut, { message: 'RUT inválido' }),
});
export type CreateCoachInput = z.infer<typeof createCoachSchema>;
