import { Request, Response, NextFunction } from 'express';
import { decryptPayload, encryptPayload } from '../utils/crypto.client';

export const cryptoMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.body && req.body.payload) {
    try {
      req.body = await decryptPayload(req.body.payload);
    } catch (error) {
      res.status(400).json({ error: 'Failed to decrypt payload' });
      return;
    }
  }
  const originalJson = res.json;
  res.json = function (data: any): Response {
    res.json = originalJson;
    encryptPayload(data).then(encrypted => {
      originalJson.call(this, { payload: encrypted });
    }).catch(err => {
      originalJson.call(this, { error: 'Encryption failed' });
    });
    return this;
  };
  next();
};
