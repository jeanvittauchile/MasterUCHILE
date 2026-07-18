import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Cliente creado por request con la anon key + el JWT propio del usuario autenticado (Authorization
 * header). Con esto, PostgREST evalúa las policies RLS con los privilegios reales del usuario — la
 * defensa en profundidad real: si un middleware de autorización de Express tuviera un bug, Postgres
 * igual bloquea filas que no le corresponden al usuario.
 */
export function supabaseForUser(userJwt: string) {
  return createClient<any>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });
}
