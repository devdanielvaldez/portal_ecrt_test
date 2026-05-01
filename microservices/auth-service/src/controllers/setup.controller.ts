import { Request, Response } from 'express';
import { CreateAdminSchema } from '../schemas/user.schema';
import * as setupService from '../services/setup.service';

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = CreateAdminSchema.parse(req.body);
    const result = await setupService.setupFirstAdmin(validatedData);
    res.status(201).json({ success: true, message: 'Admin created', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.message === 'ADMIN_ALREADY_EXISTS') {
      res.status(409).json({ error: 'Admin already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
