import type { SupabaseClient } from '@supabase/supabase-js';
import {
  bestAttempt,
  categoryForBirthDate,
  EVALUATION_LEVELS,
  levelForSalida,
  levelForViraje,
  type EvaluationLevel,
  type TechnicalEvaluationStroke,
  type TechnicalEvaluationType,
  type TurnCombination,
} from '@masteruchile/shared';
import { supabaseAdmin } from '../db/supabaseAdmin';
import { notFound } from '../lib/httpErrors';

/** Lunes de la semana ISO a la que pertenece `date`, como "YYYY-MM-DD" (clave de agrupación estable). */
function isoWeekStart(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export async function getTournamentReport(db: SupabaseClient, tournamentId: string) {
  const { data: tournament, error } = await db.from('tournaments').select('*').eq('id', tournamentId).maybeSingle();
  if (error) throw error;
  if (!tournament) throw notFound('Torneo no encontrado');

  // Participantes: nombre/categoría/pruebas son públicos dentro del equipo; se arman con el cliente
  // admin y shaping explícito para nunca incluir RUT ni datos de salud, aunque quien pida el reporte
  // sea coach (que sí tendría acceso RLS a esos campos en otras rutas).
  const { data: entries, error: entriesError } = await supabaseAdmin()
    .from('tournament_entries')
    .select('swimmer_id, pruebas, estado, users(nombre), swimmer_profiles(fecha_nacimiento)')
    .eq('tournament_id', tournamentId);
  if (entriesError) throw entriesError;

  const participants = (entries ?? []).map((e: any) => ({
    swimmerId: e.swimmer_id,
    nombre: e.users?.nombre as string,
    categoria: e.swimmer_profiles?.fecha_nacimiento ? categoryForBirthDate(e.swimmer_profiles.fecha_nacimiento)?.label ?? null : null,
    pruebas: (e.pruebas ?? []) as string[],
    estado: e.estado as string,
  }));

  return {
    ...tournament,
    totalParticipants: participants.length,
    totalEntries: participants.reduce((sum, p) => sum + p.pruebas.length, 0),
    participants,
  };
}

export async function getGeneralTournamentReport(db: SupabaseClient) {
  const { count: totalTournaments, error: tError } = await db
    .from('tournaments')
    .select('*', { count: 'exact', head: true });
  if (tError) throw tError;

  const { data: entries, error } = await supabaseAdmin()
    .from('tournament_entries')
    .select('swimmer_id, users(nombre)');
  if (error) throw error;

  const counts = new Map<string, { nombre: string; count: number }>();
  for (const e of (entries ?? []) as any[]) {
    const key = e.swimmer_id as string;
    const nombre = e.users?.nombre ?? '—';
    const current = counts.get(key) ?? { nombre, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return {
    totalTournaments: totalTournaments ?? 0,
    totalEntries: entries?.length ?? 0,
    bySwimmer: Array.from(counts.values()).sort((a, b) => b.count - a.count),
  };
}

export async function getWeeklyVolume(db: SupabaseClient, weeks = 6) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  const { data, error } = await db
    .from('trainings')
    .select('fecha, distancia_total')
    .gte('fecha', since.toISOString().slice(0, 10));
  if (error) throw error;

  const byWeek = new Map<string, number>();
  for (const t of data ?? []) {
    const week = isoWeekStart(new Date(t.fecha));
    byWeek.set(week, (byWeek.get(week) ?? 0) + (t.distancia_total ?? 0));
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, meters]) => ({ week, meters }));
}

export async function getWeeklyAttendance(db: SupabaseClient, weeks = 6) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  const { data, error } = await db
    .from('training_attendance')
    .select('estado, trainings(fecha)')
    .gte('trainings.fecha', since.toISOString().slice(0, 10));
  if (error) throw error;

  const byWeek = new Map<string, { attended: number; total: number }>();
  for (const row of (data ?? []) as any[]) {
    const fecha = row.trainings?.fecha;
    if (!fecha) continue;
    const week = isoWeekStart(new Date(fecha));
    const bucket = byWeek.get(week) ?? { attended: 0, total: 0 };
    bucket.total += 1;
    if (['confirmado', 'asistio'].includes(row.estado)) bucket.attended += 1;
    byWeek.set(week, bucket);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, { attended, total }]) => ({ week, pct: total ? Math.round((attended / total) * 100) : 0 }));
}

interface TechAttemptRaw {
  tiempo_centesimas: number;
  brazadas: number | null;
  patadas: number | null;
  subacuatico: number | null;
}

interface TechEvaluationRaw {
  swimmer_id: string;
  tipo: TechnicalEvaluationType;
  estilo: TechnicalEvaluationStroke | null;
  combinacion: TurnCombination | null;
  fecha: string;
  users: { nombre: string } | null;
  swimmer_profiles: { sexo: 'Masculino' | 'Femenino' | null } | null;
  attempts: TechAttemptRaw[];
}

interface TechMetricAccumulator {
  count: number;
  tiempoSum: number;
  secundarioSum: number;
  secundarioCount: number;
  brazadasSum: number;
  brazadasCount: number;
}

function emptyAccumulator(): TechMetricAccumulator {
  return { count: 0, tiempoSum: 0, secundarioSum: 0, secundarioCount: 0, brazadasSum: 0, brazadasCount: 0 };
}

function addAttempt(acc: TechMetricAccumulator, attempt: TechAttemptRaw, tipo: TechnicalEvaluationType) {
  acc.count += 1;
  acc.tiempoSum += attempt.tiempo_centesimas / 100;
  const secundario = tipo === 'salida' ? attempt.subacuatico : attempt.patadas;
  if (secundario != null) {
    acc.secundarioSum += secundario;
    acc.secundarioCount += 1;
  }
  if (attempt.brazadas != null) {
    acc.brazadasSum += attempt.brazadas;
    acc.brazadasCount += 1;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function summarize(acc: TechMetricAccumulator, secundarioKey: 'avgSubacuatico' | 'avgPatadas') {
  return {
    count: acc.count,
    avgTiempo: acc.count ? round2(acc.tiempoSum / acc.count) : null,
    [secundarioKey]: acc.secundarioCount ? round2(acc.secundarioSum / acc.secundarioCount) : null,
    avgBrazadas: acc.brazadasCount ? round2(acc.brazadasSum / acc.brazadasCount) : null,
  };
}

interface SwimmerLevelBucket {
  nombre: string;
  sexo: 'Masculino' | 'Femenino' | null;
  salidaAttemptsByEstilo: Map<TechnicalEvaluationStroke, TechAttemptRaw[]>;
  virajeAttemptsByCombo: Map<TurnCombination, TechAttemptRaw[]>;
}

function bestLevel<K>(
  entries: { key: K; tiempoSegundos: number; nivel: EvaluationLevel }[],
): { key: K; tiempoSegundos: number; nivel: EvaluationLevel } | null {
  if (!entries.length) return null;
  return entries.reduce((best, e) =>
    EVALUATION_LEVELS.indexOf(e.nivel) < EVALUATION_LEVELS.indexOf(best.nivel) ? e : best,
  );
}

/**
 * Reporte agregado de evaluaciones técnicas (salidas/virajes): promedios generales y por sexo,
 * progreso mensual del tiempo promedio, y el mejor nivel (tabla de referencia P/I/A/AR) alcanzado
 * por cada nadador en cada disciplina. Usa el cliente admin (igual que getTournamentReport) porque
 * cruza datos de varios nadadores (nombre, sexo) que la RLS del propio nadador no expone.
 */
export async function getTechnicalEvaluationsReport() {
  const { data, error } = await supabaseAdmin()
    .from('technical_evaluations')
    .select('swimmer_id, tipo, estilo, combinacion, fecha, users(nombre), swimmer_profiles(sexo), attempts:technical_evaluation_attempts(*)');
  if (error) throw error;

  const evaluations = (data ?? []) as unknown as TechEvaluationRaw[];

  const overall: Record<TechnicalEvaluationType, TechMetricAccumulator> = { salida: emptyAccumulator(), viraje: emptyAccumulator() };
  const byGender: Record<'Masculino' | 'Femenino', Record<TechnicalEvaluationType, TechMetricAccumulator>> = {
    Masculino: { salida: emptyAccumulator(), viraje: emptyAccumulator() },
    Femenino: { salida: emptyAccumulator(), viraje: emptyAccumulator() },
  };
  const progressByMonth: Record<TechnicalEvaluationType, Map<string, { sum: number; count: number }>> = {
    salida: new Map(),
    viraje: new Map(),
  };
  const swimmers = new Map<string, SwimmerLevelBucket>();

  for (const evaluation of evaluations) {
    const sexo = evaluation.swimmer_profiles?.sexo ?? null;
    const month = evaluation.fecha.slice(0, 7);
    const monthBucket = progressByMonth[evaluation.tipo].get(month) ?? { sum: 0, count: 0 };

    for (const attempt of evaluation.attempts) {
      addAttempt(overall[evaluation.tipo], attempt, evaluation.tipo);
      if (sexo) addAttempt(byGender[sexo][evaluation.tipo], attempt, evaluation.tipo);
      monthBucket.sum += attempt.tiempo_centesimas / 100;
      monthBucket.count += 1;
    }
    progressByMonth[evaluation.tipo].set(month, monthBucket);

    if (!swimmers.has(evaluation.swimmer_id)) {
      swimmers.set(evaluation.swimmer_id, {
        nombre: evaluation.users?.nombre ?? '—',
        sexo,
        salidaAttemptsByEstilo: new Map(),
        virajeAttemptsByCombo: new Map(),
      });
    }
    const bucket = swimmers.get(evaluation.swimmer_id)!;
    if (evaluation.tipo === 'salida' && evaluation.estilo) {
      const list = bucket.salidaAttemptsByEstilo.get(evaluation.estilo) ?? [];
      list.push(...evaluation.attempts);
      bucket.salidaAttemptsByEstilo.set(evaluation.estilo, list);
    } else if (evaluation.tipo === 'viraje' && evaluation.combinacion) {
      const list = bucket.virajeAttemptsByCombo.get(evaluation.combinacion) ?? [];
      list.push(...evaluation.attempts);
      bucket.virajeAttemptsByCombo.set(evaluation.combinacion, list);
    }
  }

  const progress = (tipo: TechnicalEvaluationType) =>
    Array.from(progressByMonth[tipo].entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, { sum, count }]) => ({ period, avgTiempo: round2(sum / count) }));

  const swimmerLevels = Array.from(swimmers.entries())
    .map(([swimmerId, bucket]) => {
      const salidaEntries = Array.from(bucket.salidaAttemptsByEstilo.entries()).flatMap(([estilo, attempts]) => {
        const best = bestAttempt(attempts);
        if (!best) return [];
        const tiempoSegundos = best.tiempo_centesimas / 100;
        return [{ key: estilo, tiempoSegundos, nivel: levelForSalida(estilo, tiempoSegundos) }];
      });
      const virajeEntries = Array.from(bucket.virajeAttemptsByCombo.entries()).flatMap(([combinacion, attempts]) => {
        const best = bestAttempt(attempts);
        if (!best) return [];
        const tiempoSegundos = best.tiempo_centesimas / 100;
        return [{ key: combinacion, tiempoSegundos, nivel: levelForViraje(combinacion, tiempoSegundos) }];
      });
      const bestSalida = bestLevel(salidaEntries);
      const bestViraje = bestLevel(virajeEntries);
      return {
        swimmerId,
        nombre: bucket.nombre,
        sexo: bucket.sexo,
        salida: bestSalida ? { estilo: bestSalida.key, mejorTiempo: bestSalida.tiempoSegundos, nivel: bestSalida.nivel } : null,
        viraje: bestViraje ? { combinacion: bestViraje.key, mejorTiempo: bestViraje.tiempoSegundos, nivel: bestViraje.nivel } : null,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return {
    overall: {
      salida: summarize(overall.salida, 'avgSubacuatico'),
      viraje: summarize(overall.viraje, 'avgPatadas'),
    },
    byGender: {
      Masculino: {
        salida: summarize(byGender.Masculino.salida, 'avgSubacuatico'),
        viraje: summarize(byGender.Masculino.viraje, 'avgPatadas'),
      },
      Femenino: {
        salida: summarize(byGender.Femenino.salida, 'avgSubacuatico'),
        viraje: summarize(byGender.Femenino.viraje, 'avgPatadas'),
      },
    },
    progress: {
      salida: progress('salida'),
      viraje: progress('viraje'),
    },
    swimmerLevels,
  };
}
