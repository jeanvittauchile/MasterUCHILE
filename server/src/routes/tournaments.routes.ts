import { Router } from 'express';
import { createEntrySchema, createTournamentSchema, updateEntrySchema } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { getTournamentReport } from '../services/reports.service';

export const tournamentsRoutes = Router();
tournamentsRoutes.use(authenticate);

tournamentsRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const { data, error } = await db.from('tournaments').select('*').order('fecha', { ascending: true });
    if (error) throw error;
    res.json({ tournaments: data ?? [] });
  }),
);

tournamentsRoutes.post(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const input = createTournamentSchema.parse(req.body);
    const db = supabaseForUser(req.token!);
    const { data, error } = await db.from('tournaments').insert(input).select().single();
    if (error) throw error;
    res.status(201).json(data);
  }),
);

tournamentsRoutes.delete(
  '/:id',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const { error } = await db.from('tournaments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  }),
);

/**
 * Detalle + reporte del torneo. La lista de participantes se arma con el cliente admin dando forma
 * explícita al payload (solo nombre/categoría/pruebas) — nunca RUT ni datos de salud, y visible tanto
 * para el coach como para cualquier nadador (el prototipo no oculta esta lista al rol swimmer).
 */
tournamentsRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    res.json(await getTournamentReport(db, req.params.id));
  }),
);

tournamentsRoutes.post(
  '/:id/entries',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const input = createEntrySchema.parse(req.body);
    const db = supabaseForUser(req.token!);
    const { data, error } = await db
      .from('tournament_entries')
      .upsert(
        { tournament_id: req.params.id, swimmer_id: input.swimmerId, pruebas: input.pruebas, estado: 'inscrito' },
        { onConflict: 'tournament_id,swimmer_id' },
      )
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  }),
);

/** El propio nadador marca su participación (RSVP); crea la fila si aún no existía inscripción. */
tournamentsRoutes.put(
  '/:id/entries/me',
  requireRole('swimmer'),
  asyncHandler(async (req, res) => {
    const { estado } = updateEntrySchema.parse(req.body);
    const db = supabaseForUser(req.token!);

    const { data: existing, error: findError } = await db
      .from('tournament_entries')
      .select('swimmer_id')
      .eq('tournament_id', req.params.id)
      .eq('swimmer_id', req.user!.id)
      .maybeSingle();
    if (findError) throw findError;

    // Update-only si ya existía (para no pisar las `pruebas` que haya asignado el coach); insert
    // con pruebas vacías si el nadador marca participación sin haber sido inscrito formalmente antes.
    const { data, error } = existing
      ? await db
          .from('tournament_entries')
          .update({ estado })
          .eq('tournament_id', req.params.id)
          .eq('swimmer_id', req.user!.id)
          .select()
          .single()
      : await db
          .from('tournament_entries')
          .insert({ tournament_id: req.params.id, swimmer_id: req.user!.id, estado, pruebas: [] })
          .select()
          .single();
    if (error) throw error;
    res.json(data);
  }),
);
