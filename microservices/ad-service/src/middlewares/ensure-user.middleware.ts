import { Request, Response, NextFunction } from 'express';

export const ensureUser = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    res.status(401).json({ error: 'Unauthorized: no user context' });
    return;
  }
  next();
};
