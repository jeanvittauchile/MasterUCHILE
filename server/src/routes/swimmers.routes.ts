import { Router } from 'express';
import {
  categoryForBirthDate,
  createSwimmerSchema,
  featuredMarksSchema,
  formatCentiseconds,
  importSwimmersSchema,
  isValidRut,
  swimmerProfileSchema,
} from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, notFound } from '../lib/httpErrors';
import { supabaseAdmin } from '../db/supabaseAdmin';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole, requireSelfOrCoach } from '../middleware/requireRole';
import { generateAndHashPin } from '../services/pin.service';
import { logAudit } from '../services/audit.service';

export const swimmersRoutes = Router();
swimmersRoutes.use(authenticate);

const HEALTH_FIELDS = ['prescripcion_medica', 'contacto_emergencia'] as const;

/** Roster completo (coach). El listado usa el JWT del coach: RLS ya permite select amplio por rol. */
swimmersRoutes.get(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const search = String(req.query.q ?? '').trim();

    let query = db.from('users').select('id, nombre, rut, activo, swimmer_profiles(*)').eq('rol', 'swimmer');
    if (search) query = query.ilike('nombre', `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;

    res.json({
      swimmers: (data ?? []).map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        pending: !u.swimmer_profiles?.perfil_completo,
        categoria: u.swimmer_profiles?.fecha_nacimiento
          ? categoryForBirthDate(u.swimmer_profiles.fecha_nacimiento)?.label
          : null,
      })),
    });
  }),
);

swimmersRoutes.post(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const input = createSwimmerSchema.parse(req.body);
    const admin = supabaseAdmin();
    const { pin, hash } = await generateAndHashPin();

    const { data: user, error } = await admin
      .from('users')
      .insert({ rol: 'swimmer', rut: input.rut, nombre: input.nombre, pin_hash: hash, pin_temporal: true })
      .select('id, nombre')
      .single();
    if (error) throw error;

    await admin.from('swimmer_profiles').insert({ user_id: user.id, perfil_completo: false });
    res.status(201).json({ id: user.id, nombre: user.nombre, pin });
  }),
);

/** Importación masiva: una línea por nadador "Nombre, RUT". Filas inválidas se reportan sin abortar el resto. */
swimmersRoutes.post(
  '/import',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const { text } = importSwimmersSchema.parse(req.body);
    const admin = supabaseAdmin();

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const imported: { nombre: string; rut: string; pin: string }[] = [];
    const rejected: { line: string; reason: string }[] = [];

    for (const line of lines) {
      const [nombreRaw, rutRaw] = line.split(',').map((s) => s?.trim());
      if (!nombreRaw || !rutRaw) {
        rejected.push({ line, reason: 'Formato esperado: Nombre, RUT' });
        continue;
      }
      if (!isValidRut(rutRaw)) {
        rejected.push({ line, reason: 'RUT inválido' });
        continue;
      }
      const { pin, hash } = await generateAndHashPin();
      const { data: user, error } = await admin
        .from('users')
        .insert({ rol: 'swimmer', rut: rutRaw, nombre: nombreRaw, pin_hash: hash, pin_temporal: true })
        .select('id, nombre')
        .single();
      if (error) {
        rejected.push({ line, reason: error.message.includes('duplicate') ? 'RUT ya registrado' : error.message });
        continue;
      }
      await admin.from('swimmer_profiles').insert({ user_id: user.id, perfil_completo: false });
      imported.push({ nombre: user.nombre, rut: rutRaw, pin });
    }

    res.json({ imported, rejected, count: imported.length });
  }),
);

/** Ficha completa: perfil + KPIs. Accesible por el propio nadador o su entrenador. */
swimmersRoutes.get(
  '/:id',
  requireSelfOrCoach('id'),
  asyncHandler(async (req, res) => {
    const db = supabaseForUser(req.token!);
    const { data: user, error } = await db
      .from('users')
      .select('id, nombre, rut, swimmer_profiles(*)')
      .eq('id', req.params.id)
      .maybeSingle<any>();
    if (error) throw error;
    if (!user) throw notFound('Nadador no encontrado');

    const { data: results } = await db
      .from('results')
      .select('id, prueba, tiempo_centesimas, fecha, es_pb')
      .eq('swimmer_id', req.params.id)
      .order('fecha', { ascending: true });

    const { data: attendance } = await db
      .from('training_attendance')
      .select('estado')
      .eq('swimmer_id', req.params.id);

    const attended = (attendance ?? []).filter((a) => ['confirmado', 'asistio'].includes(a.estado)).length;
    const attendancePct = attendance?.length ? Math.round((attended / attendance.length) * 100) : null;

    const bestOverall = (results ?? []).filter((r) => r.es_pb).sort((a, b) => a.tiempo_centesimas - b.tiempo_centesimas)[0];
    const profile = user.swimmer_profiles ?? {};

    res.json({
      id: user.id,
      nombre: user.nombre,
      rut: user.rut,
      categoria: profile.fecha_nacimiento ? categoryForBirthDate(profile.fecha_nacimiento) : null,
      perfil: profile,
      attendancePct,
      pb: bestOverall ? { prueba: bestOverall.prueba, tiempo: formatCentiseconds(bestOverall.tiempo_centesimas) } : null,
      results: (results ?? []).map((r) => ({ ...r, tiempo: formatCentiseconds(r.tiempo_centesimas) })),
    });
  }),
);

swimmersRoutes.patch(
  '/:id',
  requireSelfOrCoach('id'),
  asyncHandler(async (req, res) => {
    const input = swimmerProfileSchema.parse(req.body);
    const db = supabaseForUser(req.token!);
    const { nombre, rut, ...profileFields } = input;

    if (nombre || rut) {
      // users no tiene policy de UPDATE para authenticated (rol/pin_hash/activo son demasiado
      // sensibles para exponer incluso self-update por RLS) — nombre/rut pasan por el cliente admin,
      // ya autorizados arriba por requireSelfOrCoach.
      const { error } = await supabaseAdmin()
        .from('users')
        .update({ ...(nombre ? { nombre } : {}), ...(rut ? { rut } : {}) })
        .eq('id', req.params.id);
      if (error) throw badRequest('No se pudo actualizar el nombre/RUT', error.message);
    }

    const touchesHealthData = HEALTH_FIELDS.some((f) => f in profileFields);

    const { data, error } = await db
      .from('swimmer_profiles')
      .update({ ...profileFields, perfil_completo: true })
      .eq('user_id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    if (touchesHealthData) {
      await logAudit({
        actorId: req.user!.id,
        accion: 'edit_health_data',
        entidad: 'swimmer_profiles',
        entidadId: req.params.id,
      });
    }

    res.json(data);
  }),
);

/** Hasta 3 marcas destacadas en Inicio, elegidas por el propio nadador. */
swimmersRoutes.put(
  '/:id/featured',
  requireSelfOrCoach('id'),
  asyncHandler(async (req, res) => {
    const { resultIds } = featuredMarksSchema.parse(req.body);
    const db = supabaseForUser(req.token!);

    if (resultIds.length) {
      const { data: owned, error } = await db
        .from('results')
        .select('id')
        .eq('swimmer_id', req.params.id)
        .in('id', resultIds);
      if (error) throw error;
      if ((owned ?? []).length !== resultIds.length) {
        throw badRequest('Alguna marca seleccionada no pertenece a este nadador');
      }
    }

    const { error } = await db
      .from('swimmer_profiles')
      .update({ featured_result_ids: resultIds })
      .eq('user_id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  }),
);
