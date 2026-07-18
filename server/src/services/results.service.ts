import type { SupabaseClient } from '@supabase/supabase-js';
import { computePersonalBestId, parseTimeToCentiseconds } from '@masteruchile/shared';
import { badRequest } from '../lib/httpErrors';

export interface InsertResultInput {
  prueba: string;
  tiempo: string;
  splitDist?: '25' | '50';
  parciales?: number[];
  fecha?: string;
}

/**
 * Inserta una marca y recalcula cuál es el PB de esa prueba para el nadador (mínimo tiempo_centesimas).
 * El cálculo de "cuál id es el PB" es la función pura computePersonalBestId (packages/shared, testeada
 * con Jest); acá solo se orquesta la lectura/escritura en Postgres alrededor de esa función.
 */
export async function insertResultAndRecomputePb(
  client: SupabaseClient,
  swimmerId: string,
  input: InsertResultInput,
) {
  const tiempoCentesimas = parseTimeToCentiseconds(input.tiempo);
  if (tiempoCentesimas == null) throw badRequest('Formato de tiempo inválido (00:00.0)');

  const { data: inserted, error: insertError } = await client
    .from('results')
    .insert({
      swimmer_id: swimmerId,
      prueba: input.prueba,
      tiempo_centesimas: tiempoCentesimas,
      parciales: input.parciales ?? null,
      split_dist: input.splitDist ?? null,
      fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
      es_pb: false,
    })
    .select()
    .single();
  if (insertError) throw insertError;

  const { data: sameEvent, error: fetchError } = await client
    .from('results')
    .select('id, tiempo_centesimas')
    .eq('swimmer_id', swimmerId)
    .eq('prueba', input.prueba);
  if (fetchError) throw fetchError;

  const pbId = computePersonalBestId(
    (sameEvent ?? []).map((r) => ({ id: r.id as string, tiempoCentesimas: r.tiempo_centesimas as number })),
  );

  await client.from('results').update({ es_pb: true }).eq('id', pbId).eq('swimmer_id', swimmerId);
  await client
    .from('results')
    .update({ es_pb: false })
    .eq('swimmer_id', swimmerId)
    .eq('prueba', input.prueba)
    .neq('id', pbId);

  return { ...inserted, es_pb: inserted.id === pbId };
}
