import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@masteruchile/shared';
import { verifyAppToken } from '../services/jwt.service';
import { unauthorized } from '../lib/httpErrors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
      token?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(unauthorized());

  const token = header.slice('Bearer '.length);
  try {
    const claims = verifyAppToken(token);
    req.user = { id: claims.sub, role: claims.app_role };
    req.token = token;
    next();
  } catch {
    next(unauthorized('Sesión inválida o expirada'));
  }
}
