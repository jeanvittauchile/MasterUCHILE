import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@masteruchile/shared';
import { forbidden, unauthorized } from '../lib/httpErrors';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

/** Permite al propio nadador (:paramName === user.id) o a cualquier coach. Patrón repetido en fichas/marcas/perfil. */
export function requireSelfOrCoach(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role === 'coach') return next();
    if (req.user.id === req.params[paramName]) return next();
    next(forbidden());
  };
}
