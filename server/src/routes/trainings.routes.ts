import { Router } from 'express';
import { createTrainingSchema, updateAttendanceSchema, updateTrainingSchema } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/httpErrors';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

export const trainingsRoutes = Router();
trainingsRoutes.use(authenticate);

/**
 * Lista de sesiones (calendario). RLS ya filtra: el nadador solo ve trainings de su grupo o "Ambos";
 * el coach ve todo. `from`/`to` acotan el mes visible en el calendario.
 */
trainingsRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    let query = db.from('trainings').select('*').order('fecha', { ascending: true });
    if (req.query.from) query = query.gte('fecha', String(req.query.from));
    if (req.query.to) query = query.lte('fecha', String(req.query.to));
    const { data, error } = await query;
    if (error) throw error;
    res.json({ trainings: data ?? [] });
  }),
);

trainingsRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const { data: training, error } = await db.from('trainings').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!training) throw notFound('Sesión no encontrada');

    const attendanceQuery =
      req.user!.role === 'coach'
        ? db.from('training_attendance').select('swimmer_id, estado, confirmado_en, users(nombre)').eq('training_id', req.params.id)
        : db
            .from('training_attendance')
            .select('swimmer_id, estado, confirmado_en')
            .eq('training_id', req.params.id)
            .eq('swimmer_id', req.user!.id);
    const { data: attendance, error: attError } = await attendanceQuery;
    if (attError) throw attError;

    res.json({ ...training, attendance: attendance ?? [] });
  }),
);

/** Crea la sesión y una fila de asistencia (sin_responder) para cada nadador de su grupo. */
trainingsRoutes.post(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const input = createTrainingSchema.parse(req.body);
    const db = supabaseForUser(req.token!);

    const { data: training, error } = await db
      .from('trainings')
      .insert({
        fecha: input.fecha,
        hora: input.hora ?? null,
        foco: input.foco,
        distancia_total: input.distancia_total,
        grupo: input.grupo,
        sets: input.sets,
        creado_por: req.user!.id,
      })
      .select()
      .single();
    if (error) throw error;

    let swimmersQuery = db.from('swimmer_profiles').select('user_id, grupo');
    if (input.grupo !== 'Ambos') swimmersQuery = swimmersQuery.eq('grupo', input.grupo);
    const { data: swimmers, error: swimmersError } = await swimmersQuery;
    if (swimmersError) throw swimmersError;

    if (swimmers?.length) {
      await db.from('training_attendance').insert(
        swimmers.map((s) => ({ training_id: training.id, swimmer_id: s.user_id, estado: 'sin_responder' as const })),
      );
    }

    res.status(201).json(training);
  }),
);

/** Edita los datos de la sesión ya guardada. No resincroniza training_attendance (el grupo pudo cambiar
 * pero las confirmaciones ya registradas de los nadadores no se tocan). */
trainingsRoutes.patch(
  '/:id',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const input = updateTrainingSchema.parse(req.body);
    const db = supabaseForUser(req.token!);
    const { data, error } = await db
      .from('trainings')
      .update(input)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound('Sesión no encontrada');
    res.json(data);
  }),
);

/** Elimina la sesión; training_attendance se borra en cascada (FK on delete cascade). */
trainingsRoutes.delete(
  '/:id',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const { data, error } = await db.from('trainings').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw notFound('Sesión no encontrada');
    res.status(204).send();
  }),
);

/** El propio nadador confirma o declina su asistencia a una sesión. */
trainingsRoutes.patch(
  '/:id/attendance/me',
  requireRole('swimmer'),
  asyncHandler(async (req, res) => {
    const { estado } = updateAttendanceSchema.parse(req.body);
    if (!['confirmado', 'declinado'].includes(estado)) {
      throw badRequest('Estado inválido para auto-confirmación (usa confirmado o declinado)');
    }
    const db = supabaseForUser(req.token!);
    const { data, error } = await db
      .from('training_attendance')
      .update({ estado, confirmado_en: new Date().toISOString() })
      .eq('training_id', req.params.id)
      .eq('swimmer_id', req.user!.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  }),
);

/** El entrenador registra asistencia real post-sesión (asistió/faltó) para cualquier nadador. */
trainingsRoutes.patch(
  '/:id/attendance/:swimmerId',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const { estado } = updateAttendanceSchema.parse(req.body);
    const db = supabaseForUser(req.token!);
    const { data, error } = await db
      .from('training_attendance')
      .update({ estado, confirmado_en: new Date().toISOString() })
      .eq('training_id', req.params.id)
      .eq('swimmer_id', req.params.swimmerId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  }),
);
