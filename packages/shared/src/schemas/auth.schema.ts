import { z } from 'zod';
import { isValidPin } from '../validation/pin';

export const pinSchema = z.string().refine(isValidPin, { message: 'El PIN debe tener 4 dígitos' });

export const loginSchema = z.object({
  identidad: z.string().trim().min(1, 'Ingresa tu RUT o nombre'),
  pin: pinSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePinSchema = z
  .object({
    pinActual: pinSchema.optional(),
    pinNuevo: pinSchema,
    pinRepetido: pinSchema,
  })
  .refine((data) => data.pinNuevo === data.pinRepetido, {
    message: 'Los PIN no coinciden',
    path: ['pinRepetido'],
  });
export type ChangePinInput = z.infer<typeof changePinSchema>;

export const restorePinSchema = z.object({
  swimmerId: z.string().uuid(),
});
export type RestorePinInput = z.infer<typeof restorePinSchema>;
