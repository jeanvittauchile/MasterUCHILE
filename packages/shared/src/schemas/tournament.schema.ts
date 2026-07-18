import { z } from 'zod';

export const createTournamentSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  fecha: z.string().trim().min(1, 'La fecha es obligatoria'),
  lugar: z.string().trim().min(1, 'El lugar es obligatorio'),
});
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;

export const createEntrySchema = z.object({
  swimmerId: z.string().uuid(),
  pruebas: z.array(z.string().trim().min(1)).min(1, 'Selecciona al menos una prueba'),
});
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = z.object({
  estado: z.enum(['inscrito', 'participo']),
});
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
