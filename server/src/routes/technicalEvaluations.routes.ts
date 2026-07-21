import { Router } from 'express';
import { createTechnicalEvaluationSchema } from '@masteruchile/shared';
import { asyncHandler } from '../lib/asyncHandler';
import { badRequest, forbidden } from '../lib/httpErrors';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { insertTechnicalEvaluation } from '../services/technicalEvaluations.service';

export const technicalEvaluationsRoutes = Router();
technicalEvaluationsRoutes.use(authenticate);

technicalEvaluationsRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const swimmerId =
      req.user!.role === 'coach' ? (req.query.swimmerId as string | undefined) : req.user!.id;
    if (!swimmerId) throw badRequest('swimmerId es obligatorio para el entrenador');
    if (req.user!.role === 'swimmer' && swimmerId !== req.user!.id) throw forbidden();

    const db = supabaseForUser(req.token!);
    let query = db
      .from('technical_evaluations')
      .select('*, attempts:technical_evaluation_attempts(*)')
      .eq('swimmer_id', swimmerId)
      .order('fecha', { ascending: false });
    if (req.query.tipo) query = query.eq('tipo', String(req.query.tipo));

    const { data, error } = await query;
    if (error) throw error;
    res.json({ evaluations: data ?? [] });
  }),
);

technicalEvaluationsRoutes.post(
  '/',
  requireRole('coach'),
  asyncHandler(async (req, res) => {
    const { swimmerId, ...rest } = req.body ?? {};
    if (!swimmerId) throw badRequest('swimmerId es obligatorio');
    const input = createTechnicalEvaluationSchema.parse(rest);
    const db = supabaseForUser(req.token!);
    const evaluation = await insertTechnicalEvaluation(db, swimmerId, req.user!.id, input);
    res.status(201).json(evaluation);
  }),
);
