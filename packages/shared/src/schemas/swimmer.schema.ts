import { z } from 'zod';
import { isValidRut } from '../validation/rut';
import { isValidEmail } from '../validation/email';
import { isValidPhone } from '../validation/phone';

const rutField = z.string().trim().refine(isValidRut, { message: 'RUT inválido' });

export const createSwimmerSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  rut: rutField,
});
export type CreateSwimmerInput = z.infer<typeof createSwimmerSchema>;

/** Una línea por nadador: "Nombre, RUT". Se parsea en el backend antes de validar cada fila con createSwimmerSchema. */
export const importSwimmersSchema = z.object({
  text: z.string().trim().min(1, 'Pega al menos una línea con Nombre, RUT'),
});
export type ImportSwimmersInput = z.infer<typeof importSwimmersSchema>;

export const swimmerProfileSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  rut: rutField.optional(),
  fecha_nacimiento: z.string().date().optional(),
  email: z.string().trim().refine(isValidEmail, { message: 'Email inválido' }).optional(),
  telefono: z.string().trim().refine(isValidPhone, { message: 'Teléfono inválido' }).optional(),
  estilo_1: z.string().trim().min(1).optional(),
  estilo_2: z.string().trim().min(1).optional(),
  prueba_fav_1: z.string().trim().min(1).optional(),
  prueba_fav_2: z.string().trim().min(1).optional(),
  grupo: z.enum(['AM', 'PM']).optional(),
  sexo: z.enum(['Masculino', 'Femenino']).optional(),
  prescripcion_medica: z.string().trim().optional(),
  contacto_emergencia: z.string().trim().optional(),
});
export type SwimmerProfileInput = z.infer<typeof swimmerProfileSchema>;

export const featuredMarksSchema = z.object({
  resultIds: z.array(z.string().uuid()).max(3, 'Puedes destacar hasta 3 marcas'),
});
export type FeaturedMarksInput = z.infer<typeof featuredMarksSchema>;
