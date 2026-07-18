import { supabaseAdmin } from '../db/supabaseAdmin';
import { tooManyRequests } from '../lib/httpErrors';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

interface AttemptRow {
  identidad: string;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  ultimo_intento_en: string | null;
}

/**
 * Rate-limiting de login persistido en Postgres (no en memoria de proceso): el backend corre como
 * funciones serverless en Vercel, sin estado compartido entre invocaciones, así que un contador en
 * memoria no protegería nada. Solo 10.000 combinaciones de PIN posibles -> el bloqueo temporal es
 * obligatorio, no opcional.
 */
export async function assertNotLocked(identidadKey: string): Promise<void> {
  const { data } = await supabaseAdmin()
    .from('login_attempts')
    .select('identidad, intentos_fallidos, bloqueado_hasta, ultimo_intento_en')
    .eq('identidad', identidadKey)
    .maybeSingle<AttemptRow>();

  if (data?.bloqueado_hasta && new Date(data.bloqueado_hasta).getTime() > Date.now()) {
    const retryAt = data.bloqueado_hasta;
    throw tooManyRequests('Demasiados intentos fallidos. Intenta más tarde.', { retryAt });
  }
}

export async function registerFailedAttempt(identidadKey: string): Promise<void> {
  const { data } = await supabaseAdmin()
    .from('login_attempts')
    .select('intentos_fallidos')
    .eq('identidad', identidadKey)
    .maybeSingle<Pick<AttemptRow, 'intentos_fallidos'>>();

  const nextCount = (data?.intentos_fallidos ?? 0) + 1;
  const bloqueado_hasta =
    nextCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null;

  await supabaseAdmin()
    .from('login_attempts')
    .upsert(
      {
        identidad: identidadKey,
        intentos_fallidos: nextCount,
        bloqueado_hasta,
        ultimo_intento_en: new Date().toISOString(),
      },
      { onConflict: 'identidad' },
    );
}

export async function registerSuccessfulAttempt(identidadKey: string): Promise<void> {
  await supabaseAdmin()
    .from('login_attempts')
    .upsert(
      { identidad: identidadKey, intentos_fallidos: 0, bloqueado_hasta: null, ultimo_intento_en: new Date().toISOString() },
      { onConflict: 'identidad' },
    );
}
