import { z } from 'zod';

export const createTournamentSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  fecha: z.string().date('Formato de fecha inválido (AAAA-MM-DD)'),
  fechaFin: z.string().date('Formato de fecha inválido (AAAA-MM-DD)').optional(),
  lugar: z.string().trim().optional(),
  prioritario: z.boolean().optional(),
});
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;

export const updateTournamentSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  fecha: z.string().date('Formato de fecha inválido (AAAA-MM-DD)').optional(),
  fechaFin: z.string().date('Formato de fecha inválido (AAAA-MM-DD)').nullable().optional(),
  lugar: z.string().trim().nullable().optional(),
  estado: z.string().trim().min(1).optional(),
  prioritario: z.boolean().optional(),
});
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;

/** Una línea por torneo: "DD[-DD] [de] Mes [AAAA][:] Nombre [(prioritario...)]". */
export const importTournamentsSchema = z.object({
  text: z.string().trim().min(1, 'Pega al menos una línea con la fecha y el nombre del torneo'),
});
export type ImportTournamentsInput = z.infer<typeof importTournamentsSchema>;

export const createEntrySchema = z.object({
  swimmerId: z.string().uuid(),
  pruebas: z.array(z.string().trim().min(1)).min(1, 'Selecciona al menos una prueba'),
});
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = z.object({
  estado: z.enum(['inscrito', 'participo']),
});
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
