import jwt from 'jsonwebtoken';
import type { AppJwtClaims, UserRole } from '@masteruchile/shared';
import { env } from '../db/env';

// jsonwebtoken tipa expiresIn contra un literal template ("12h", "3600s", ...); viene de env como
// string genérico en runtime, así que se castea explícitamente en vez de forzar el tipo de la env var.
const EXPIRES_IN = (process.env.APP_JWT_EXPIRES_IN ?? '12h') as jwt.SignOptions['expiresIn'];

/**
 * Firma un JWT compatible con Supabase: mismo SUPABASE_JWT_SECRET, `role: "authenticated"` (para que
 * PostgREST resuelva el rol de Postgres correctamente) + `app_role` como claim custom de negocio.
 */
export function signAppToken(userId: string, appRole: UserRole): string {
  return jwt.sign({ role: 'authenticated', app_role: appRole }, env.SUPABASE_JWT_SECRET, {
    subject: userId,
    expiresIn: EXPIRES_IN,
  });
}

export function verifyAppToken(token: string): AppJwtClaims {
  return jwt.verify(token, env.SUPABASE_JWT_SECRET) as AppJwtClaims;
}
