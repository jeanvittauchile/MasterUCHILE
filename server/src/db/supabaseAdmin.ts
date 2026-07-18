import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Cliente con la service_role key: bypassa RLS por completo.
 * Uso restringido a operaciones legítimamente cross-user que no pueden depender del JWT de un usuario
 * ya autenticado: login (buscar pin_hash de cualquier identidad), import masivo, restaurar PIN,
 * rate-limiting de login (login_attempts) y el directorio público reducido de nadadores.
 */
let client: ReturnType<typeof createClient<any>> | null = null;

// Generic <any>: no mantenemos un tipo Database generado; los payloads se validan con zod
// (packages/shared) antes de llegar acá, así que la tipificación estricta de postgrest-js no aporta
// seguridad extra y solo produciría fricción (`never` en inserts/updates sin un Database type).
export function supabaseAdmin() {
  if (!client) {
    client = createClient<any>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
