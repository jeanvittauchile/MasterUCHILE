import { Router } from 'express';
import { createResultSchema, formatCentiseconds } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, forbidden } from '../lib/httpErrors';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { insertResultAndRecomputePb } from '../services/results.service';

export const resultsRoutes = Router();
resultsRoutes.use(authenticate);

/** El nadador solo puede ver/crear las propias; el coach puede indicar swimmerId en query/body para cualquiera. */
function resolveSwimmerId(req: import('express').Request, provided?: string): string {
  if (req.user!.role === 'coach') {
    if (!provided) throw badRequest('swimmerId es obligatorio para el entrenador');
    return provided;
  }
  if (provided && provided !== req.user!.id) throw forbidden();
  return req.user!.id;
}

resultsRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const swimmerId = resolveSwimmerId(req, req.query.swimmerId as string | undefined);
    const db = supabaseForUser(req.token!);
    let query = db.from('results').select('*').eq('swimmer_id', swimmerId).order('fecha', { ascending: true });
    if (req.query.prueba) query = query.eq('prueba', String(req.query.prueba));
    const { data, error } = await query;
    if (error) throw error;
    res.json({ results: (data ?? []).map((r) => ({ ...r, tiempo: formatCentiseconds(r.tiempo_centesimas) })) });
  }),
);

resultsRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { swimmerId: bodySwimmerId, ...rest } = req.body ?? {};
    const input = createResultSchema.parse(rest);
    const swimmerId = resolveSwimmerId(req, bodySwimmerId);
    const db = supabaseForUser(req.token!);
    const result = await insertResultAndRecomputePb(db, swimmerId, input);
    res.status(201).json({ ...result, tiempo: formatCentiseconds(result.tiempo_centesimas) });
  }),
);
