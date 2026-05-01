import { Request, Response } from 'express';
import { EncryptRequestSchema, DecryptRequestSchema } from '../schemas/crypto.schema';
import { encrypt, decrypt } from '../services/crypto.service';

export const encryptHandler = (req: Request, res: Response): void => {
  try {
    const { data } = EncryptRequestSchema.parse(req.body);
    const encrypted = encrypt(data);
    res.status(200).json({ success: true, payload: encrypted });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request body', details: error.errors });
    } else {
      res.status(500).json({ error: 'Encryption failed' });
    }
  }
};

export const decryptHandler = (req: Request, res: Response): void => {
  try {
    const { payload } = DecryptRequestSchema.parse(req.body);
    const decrypted = decrypt(payload);
    res.status(200).json({ success: true, data: decrypted });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request body', details: error.errors });
    } else if (error.message === 'Invalid payload format') {
      res.status(400).json({ error: 'Invalid encrypted payload format' });
    } else {
      res.status(500).json({ error: 'Decryption failed' });
    }
  }
};
