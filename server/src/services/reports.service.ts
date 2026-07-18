import type { SupabaseClient } from '@supabase/supabase-js';
import { categoryForBirthDate } from '@masteruchile/shared';
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
