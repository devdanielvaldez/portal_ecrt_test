import { Request, Response } from 'express';
import {
  SignUpSchema,
  SignInSchema,
  ForgetPasswordSchema,
  ChangePasswordSchema,
  DeviceLoginSchema,
} from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = SignUpSchema.parse(req.body);
    const result = await authService.signUp(data);
    res.status(201).json({ success: true, message: 'User registered', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.response?.status === 403 && error.response?.data?.message === 'User already exists') {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = SignInSchema.parse(req.body);
    const result = await authService.signIn(email, phone, password);
    res.status(200).json({ success: true, message: 'Sign in successful', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.response?.status === 403 && error.response?.data?.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = ForgetPasswordSchema.parse(req.body);
    const result = await authService.forgetPassword(email, phone);
    res.status(200).json({ success: true, message: 'Temporal password generated', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.response?.status === 400) {
      res.status(400).json({ error: error.response.data?.message || 'Bad request' });
      return;
    }
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: any = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const { currentPassword, password } = ChangePasswordSchema.parse(req.body);
    await authService.changePassword(userId, currentPassword, password);
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    if (error.response?.status === 400) {
      res.status(400).json({ error: error.response.data?.message || 'Invalid password format' });
      return;
    }
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'Invalid current password' });
      return;
    }
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'User not found' });
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
      res.status(401).json({ error: 'Invalid device credentials' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
