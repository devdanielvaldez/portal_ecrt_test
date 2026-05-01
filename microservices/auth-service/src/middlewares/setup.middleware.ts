import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const requireMasterKey = (req: Request, res: Response, next: NextFunction): void => {
  const masterKey = req.headers['x-master-key'];
  if (!masterKey || masterKey !== process.env.SETUP_MASTER_KEY) {
    res.status(403).json({ error: 'Invalid or missing master key' });
    return;
  }
  next();
};
