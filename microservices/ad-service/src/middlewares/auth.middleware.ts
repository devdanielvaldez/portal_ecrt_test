import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }
    req.user = decoded;
    if (req.user && req.user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'User account is inactive' });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireDevice = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'DEVICE') {
      res.status(403).json({ error: 'Device role required' });
      return;
    }
    req.user = decoded;
    if (req.user && req.user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'User account is inactive' });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
