import { Router } from 'express';
import { averageEvaluationScore, createEvaluationSchema } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, forbidden } from '../lib/httpErrors';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

export const evaluationsRoutes = Router();
evaluationsRoutes.use(authenticate);

evaluationsRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const swimmerId =
      req.user!.role === 'coach' ? (req.query.swimmerId as string | undefined) : req.user!.id;
    if (!swimmerId) throw badRequest('swimmerId es obligatorio para el entrenador');
    if (req.user!.role === 'swimmer' && swimmerId !== req.user!.id) throw forbidden();

    const db = supabaseForUser(req.token!);
    const { data, error } = await db
      .from('evaluations')
      .select('*')
      .eq('swimmer_id', swimmerId)
      .order('fecha', { ascending: false });
    if (error) throw error;

    const evaluations = (data ?? []).map((e) => ({ ...e, promedio: averageEvaluationScore(e.scores) }));
    res.json({ evaluations, latest: evaluations[0] ?? null });
  }),
);

evaluationsRoutes.post(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const { swimmerId, ...rest } = req.body ?? {};
    if (!swimmerId) throw badRequest('swimmerId es obligatorio');
    const input = createEvaluationSchema.parse(rest);
    const db = supabaseForUser(req.token!);

    const { data, error } = await db
      .from('evaluations')
      .insert({
        swimmer_id: swimmerId,
        fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
        scores: input.scores,
        nota: input.nota ?? null,
        creado_por: req.user!.id,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ ...data, promedio: averageEvaluationScore(data.scores) });
  }),
);
