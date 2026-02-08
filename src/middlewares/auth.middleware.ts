import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  // Accept "Bearer <token>" or raw token in Authorization header
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader?.trim();
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', detail: 'Missing or invalid Authorization header. Use: Authorization: Bearer <token>' });
  }
  try {
    const decoded = jwt.verify(token, 'SECRET') as jwt.JwtPayload & { uid?: number };
    (req as Request & { user?: jwt.JwtPayload & { uid?: number } }).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized', detail: 'Invalid or expired token' });
  }
};
