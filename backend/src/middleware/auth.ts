import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Access token missing or invalid',
      code: 'TOKEN_MISSING'
    });
  }

  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-project-management-system';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        error: 'Unauthorized',
        message: isExpired ? 'Token has expired. Please log in again.' : 'Invalid token.',
        code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      });
    }

    req.user = decoded as { id: string; email: string };
    next();
  });
};
