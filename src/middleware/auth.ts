import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

/**  
 * 1) Verify JWT, attach decoded payload to req.user  
 * 2) 401 if missing / invalid  
 */
export const authenticateJWT: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or malformed token' });
    throw new Error('Missing or malformed token');
  }

  const token = auth.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as { sub: string; role: Role };
    console.log("cek payload", payload);
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**  
 * roleList: e.g. ['admin','instruktur']  
 * 403 if req.user.role is not in list  
 */
export function authorizeRoles(...roleList: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = (req as AuthRequest).user ?? {};
    if (!role || !roleList.includes(role)) {
        res.status(403).json({ message: 'Insufficient Role to access' });
    }
    next();
  };
}
