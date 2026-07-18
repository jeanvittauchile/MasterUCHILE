import { Router } from 'express';
import {
  changePinSchema,
  loginSchema,
  looksLikeRut,
  normalizeRut,
} from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { unauthorized } from '../lib/httpErrors';
import { supabaseAdmin } from '../db/supabaseAdmin';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { signAppToken } from '../services/jwt.service';
import { generateAndHashPin, hashPin, verifyPin } from '../services/pin.service';
import { assertNotLocked, registerFailedAttempt, registerSuccessfulAttempt } from '../services/loginAttempts.service';
import { logAudit } from '../services/audit.service';

export const authRoutes = Router();

interface UserAuthRow {
  id: string;
  rol: 'coach' | 'swimmer';
  nombre: string;
  rut: string;
  pin_hash: string;
  pin_temporal: boolean;
  activo: boolean;
}

authRoutes.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { identidad, pin } = loginSchema.parse(req.body);

    // Clave de rate-limit normalizada: misma identidad en distintos formatos cuenta como una sola.
    const identidadKey = looksLikeRut(identidad) ? normalizeRut(identidad) : identidad.trim().toLowerCase();
    await assertNotLocked(identidadKey);

    const admin = supabaseAdmin();
    const query = looksLikeRut(identidad)
      ? admin.from('users').select('*').eq('rut_normalizado', normalizeRut(identidad))
      : admin.from('users').select('*').ilike('nombre', identidad.trim());

    const { data: matches, error } = await query.returns<UserAuthRow[]>();
    if (error) throw error;

    // 0 o >1 coincidencias: mismo error genérico que un PIN incorrecto (evita enumeración de usuarios).
    const user = matches?.length === 1 ? matches[0] : null;
    if (!user || !user.activo) {
      await registerFailedAttempt(identidadKey);
      throw unauthorized('Identidad o PIN incorrectos');
    }

    const pinOk = await verifyPin(pin, user.pin_hash);
    if (!pinOk) {
      await registerFailedAttempt(identidadKey);
      throw unauthorized('Identidad o PIN incorrectos');
    }

    await registerSuccessfulAttempt(identidadKey);
    const token = signAppToken(user.id, user.rol);
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, rol: user.rol, pinTemporal: user.pin_temporal },
    });
  }),
);

authRoutes.post(
  '/change-pin',
  authenticate,
  asyncHandler(async (req, res) => {
    const { pinActual, pinNuevo } = changePinSchema.parse(req.body);
    const admin = supabaseAdmin();

    const { data: user, error } = await admin
      .from('users')
      .select('id, pin_hash, pin_temporal')
      .eq('id', req.user!.id)
      .single<{ id: string; pin_hash: string; pin_temporal: boolean }>();
    if (error) throw error;

    // Si el PIN ya no es temporal, el cambio "voluntario" (desde Perfil) exige el PIN actual.
    if (!user.pin_temporal) {
      if (!pinActual || !(await verifyPin(pinActual, user.pin_hash))) {
        throw unauthorized('PIN actual incorrecto');
      }
    }

    const newHash = await hashPin(pinNuevo);
    await admin.from('users').update({ pin_hash: newHash, pin_temporal: false }).eq('id', user.id);
    await logAudit({ actorId: req.user!.id, accion: 'change_pin', entidad: 'users', entidadId: user.id });

    res.json({ ok: true });
  }),
);

authRoutes.post(
  '/swimmers/:swimmerId/restore-pin',
  authenticate,
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const { swimmerId } = req.params;
    const admin = supabaseAdmin();
    const { pin, hash } = await generateAndHashPin();

    const { error } = await admin
      .from('users')
      .update({ pin_hash: hash, pin_temporal: true })
      .eq('id', swimmerId)
      .eq('rol', 'swimmer');
    if (error) throw error;

    await logAudit({
      actorId: req.user!.id,
      accion: 'restore_pin',
      entidad: 'users',
      entidadId: swimmerId,
    });

    res.json({ pin });
  }),
);
