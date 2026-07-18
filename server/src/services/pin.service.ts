import bcrypt from 'bcryptjs';
import { generatePin } from '@masteruchile/shared';

const SALT_ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/** Genera un PIN de 4 dígitos en texto plano (para mostrarlo una vez al entrenador) + su hash. */
export async function generateAndHashPin(): Promise<{ pin: string; hash: string }> {
  const pin = generatePin();
  const hash = await hashPin(pin);
  return { pin, hash };
}
