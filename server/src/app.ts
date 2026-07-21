import cors from 'cors';
import express from 'express';
import { env } from './db/env';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { coachesRoutes } from './routes/coaches.routes';
import { swimmersRoutes } from './routes/swimmers.routes';
import { trainingsRoutes } from './routes/trainings.routes';
import { tournamentsRoutes } from './routes/tournaments.routes';
import { resultsRoutes } from './routes/results.routes';
import { evaluationsRoutes } from './routes/evaluations.routes';
import { technicalEvaluationsRoutes } from './routes/technicalEvaluations.routes';
import { reportsRoutes } from './routes/reports.routes';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/auth', authRoutes);
  app.use('/coaches', coachesRoutes);
  app.use('/swimmers', swimmersRoutes);
  app.use('/trainings', trainingsRoutes);
  app.use('/tournaments', tournamentsRoutes);
  app.use('/results', resultsRoutes);
  app.use('/evaluations', evaluationsRoutes);
  app.use('/technical-evaluations', technicalEvaluationsRoutes);
  app.use('/reports', reportsRoutes);

  app.use(errorHandler);
  return app;
}
