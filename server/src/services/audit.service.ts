import { supabaseAdmin } from '../db/supabaseAdmin';

/**
 * Registro de auditoría (restauraciones de PIN, ediciones de datos de salud). Siempre vía el cliente
 * admin: audit_log no tiene policies para authenticated/anon a propósito, solo debe ser escribible
 * desde el backend, nunca directamente por un cliente.
 */
export async function logAudit(params: {
  actorId: string;
  accion: string;
  entidad?: string;
  entidadId?: string;
  detalle?: Record<string, unknown>;
}): Promise<void> {
  await supabaseAdmin()
    .from('audit_log')
    .insert({
      actor_id: params.actorId,
      accion: params.accion,
      entidad: params.entidad ?? null,
      entidad_id: params.entidadId ?? null,
      detalle: params.detalle ?? null,
    });
}
