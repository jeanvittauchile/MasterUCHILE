import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { supabaseForUser } from '../db/supabaseForUser';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  getGeneralTournamentReport,
  getTechnicalEvaluationsReport,
  getTournamentReport,
  getWeeklyAttendance,
  getWeeklyVolume,
} from '../services/reports.service';
import { generateGeneralReportPdf, generateTournamentReportPdf } from '../services/pdf.service';

export const reportsRoutes = Router();
reportsRoutes.use(authenticate, requireRole('coach'));

reportsRoutes.get(
  '/weekly-volume',
  asyncHandler(async (req, res) => {
    res.json({ weeks: await getWeeklyVolume(supabaseForUser(req.token!)) });
  }),
);

reportsRoutes.get(
  '/attendance',
  asyncHandler(async (req, res) => {
    res.json({ weeks: await getWeeklyAttendance(supabaseForUser(req.token!)) });
  }),
);

reportsRoutes.get(
  '/technical-evaluations',
  asyncHandler(async (_req, res) => {
    res.json(await getTechnicalEvaluationsReport());
  }),
);

reportsRoutes.get(
  '/tournaments/general',
  asyncHandler(async (req, res) => {
    res.json(await getGeneralTournamentReport(supabaseForUser(req.token!)));
  }),
);

reportsRoutes.get(
  '/tournaments/general.pdf',
  asyncHandler(async (req, res) => {
    const data = await getGeneralTournamentReport(supabaseForUser(req.token!));
    generateGeneralReportPdf(res, data);
  }),
);

reportsRoutes.get(
  '/tournaments/:id.pdf',
  asyncHandler(async (req, res) => {
    const data = await getTournamentReport(supabaseForUser(req.token!), req.params.id);
    generateTournamentReportPdf(res, data);
  }),
);
