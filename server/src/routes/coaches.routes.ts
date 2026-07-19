import { Router } from 'express';
import { createCoachSchema } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { supabaseAdmin } from '../db/supabaseAdmin';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { generateAndHashPin } from '../services/pin.service';
import { logAudit } from '../services/audit.service';

export const coachesRoutes = Router();
coachesRoutes.use(authenticate, requireRole('coach'));

/** Roster de entrenadores. Solo visible entre entrenadores, para poder darse de alta entre sí y recuperar PINes. */
coachesRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('users')
      .select('id, nombre, rut, activo')
      .eq('rol', 'coach')
      .order('nombre');
    if (error) throw error;
    res.json({ coaches: data ?? [] });
  }),
);

coachesRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createCoachSchema.parse(req.body);
    const admin = supabaseAdmin();
    const { pin, hash } = await generateAndHashPin();

    const { data: user, error } = await admin
      .from('users')
      .insert({ rol: 'coach', rut: input.rut, nombre: input.nombre, pin_hash: hash, pin_temporal: true })
      .select('id, nombre')
      .single();
    if (error) throw error;

    await logAudit({ actorId: req.user!.id, accion: 'create_coach', entidad: 'users', entidadId: user.id });
    res.status(201).json({ id: user.id, nombre: user.nombre, pin });
  }),
);

/** Regenera un PIN temporal para otro entrenador (recuperación cuando lo olvidó). */
coachesRoutes.post(
  '/:coachId/restore-pin',
  asyncHandler(async (req, res) => {
    const { coachId } = req.params;
    const admin = supabaseAdmin();
    const { pin, hash } = await generateAndHashPin();

    const { error } = await admin
      .from('users')
      .update({ pin_hash: hash, pin_temporal: true })
      .eq('id', coachId)
      .eq('rol', 'coach');
    if (error) throw error;

    await logAudit({ actorId: req.user!.id, accion: 'restore_pin', entidad: 'users', entidadId: coachId });
    res.json({ pin });
  }),
);
