import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const requireMasterKey = (req: Request, res: Response, next: NextFunction): void => {
  console.log(process.env);
  
  const masterKey = req.headers['x-master-key'];
  console.log(masterKey);
  console.log(req.headers);
  
  if (!masterKey || masterKey !== process.env.SETUP_MASTER_KEY || 'Prueba01*') {
    res.status(403).json({ error: 'Invalid or missing master key' });
    return;
  }
  next();
};
