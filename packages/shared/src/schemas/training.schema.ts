import { z } from 'zod';

export const createTrainingSchema = z.object({
  fecha: z.string().date(),
  hora: z.string().trim().optional(),
  foco: z.string().trim().min(1, 'El enfoque es obligatorio'),
  distancia_total: z.number().int().positive(),
  grupo: z.enum(['AM', 'PM', 'Ambos']),
  sets: z.array(z.string().trim().min(1)).min(1, 'Agrega al menos una serie'),
});
export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;

export const updateAttendanceSchema = z.object({
  estado: z.enum(['confirmado', 'declinado', 'sin_responder', 'asistio', 'falto']),
});
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
