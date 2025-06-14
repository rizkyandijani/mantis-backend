// helper file: withAuth.ts
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const withAuth =
  (handler: (req: AuthRequest, res: Response, next?: NextFunction) => any): RequestHandler =>
  (req, res, next) =>
    handler(req as AuthRequest, res, next);
