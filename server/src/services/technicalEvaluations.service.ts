import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTimeToCentiseconds, type CreateTechnicalEvaluationInput } from '@masteruchile/shared';
import { badRequest } from '../lib/httpErrors';

/**
 * Inserta la evaluación (header) y sus intentos en una segunda escritura. Si falla la inserción
 * de intentos, el header queda huérfano; se acepta porque no hay transacciones multi-statement
 * disponibles vía PostgREST y el header solo no se muestra sin intentos (ver GET, siempre con embed).
 */
export async function insertTechnicalEvaluation(
  client: SupabaseClient,
  swimmerId: string,
  creadoPor: string,
  input: CreateTechnicalEvaluationInput,
) {
  const { data: evaluation, error: evalError } = await client
    .from('technical_evaluations')
    .insert({
      swimmer_id: swimmerId,
      tipo: input.tipo,
      fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
      nota: input.nota ?? null,
      creado_por: creadoPor,
    })
    .select()
    .single();
  if (evalError) throw evalError;

  const attemptsPayload = input.attempts.map((a) => {
    const tiempoCentesimas = parseTimeToCentiseconds(a.tiempo);
    if (tiempoCentesimas == null) throw badRequest('Formato de tiempo inválido (00:00.0)');
    return {
      evaluation_id: evaluation.id,
      numero_intento: a.numeroIntento,
      tiempo_centesimas: tiempoCentesimas,
      brazadas: a.brazadas ?? null,
      patadas: a.patadas ?? null,
      subacuatico: a.subacuatico ?? null,
    };
  });

  const { data: attempts, error: attemptsError } = await client
    .from('technical_evaluation_attempts')
    .insert(attemptsPayload)
    .select();
  if (attemptsError) throw attemptsError;

  return { ...evaluation, attempts: attempts ?? [] };
}
