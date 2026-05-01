import { Request, Response } from 'express';
import { LoginSchema, DeviceLoginSchema } from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const result = await authService.loginAdmin(validatedData);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.message === 'CREDENTIALS_INVALID') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (error.message === 'UNAUTHORIZED_ROLE') {
      res.status(403).json({ error: 'Access denied, admin only' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const result = await authService.loginOrganization(validatedData);
    res.status(200).json({ success: true, message: 'Organization login successful', data: result });
  } catch (error: any) {
    if (error.message === 'CREDENTIALS_INVALID') {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    if (error.message === 'USER_INACTIVE') {
      res.status(403).json({ error: 'Inactive user' });
      return;
    }
    if (error.message === 'UNAUTHORIZED_ROLE') {
      res.status(403).json({ error: 'Access denied, organization users only' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serial_number, password } = DeviceLoginSchema.parse(req.body);
    const result = await authService.loginDevice(serial_number, password);
    res.status(200).json({ success: true, message: 'Device authenticated', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.message === 'DEVICE_INVALID') {
      res.status(401).json({ error: 'Invalid serial number or password' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
