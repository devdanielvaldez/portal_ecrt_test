import { Request, Response, NextFunction } from 'express';
import { verifySignature } from '../services/signature.service';

export const requireValidSignature = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { expires, signature } = req.query;
    const filePath = req.params[0];
    if (!expires || !signature || !filePath) {
      res.status(403).json({ error: 'Missing security parameters' });
      return;
    }
    const isValid = verifySignature(filePath, expires as string, signature as string);
    if (!isValid) {
      res.status(403).json({ error: 'Invalid or expired URL' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Signature validation error' });
  }
};
