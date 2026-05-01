import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';
import { CreateOrgUserSchema, UpdateUserSchema, ChangePasswordSchema } from '../schemas/user.schema';

export const createOrgUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, organization_id } = CreateOrgUserSchema.parse(req.body);
    const result = await userService.createOrgUser(email, organization_id);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrgUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.params.orgId as string;
    const users = await userService.getUsersByOrg(orgId);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const data = UpdateUserSchema.parse(req.body);
    const user = await userService.updateUser(userId, data);
    res.status(200).json({ success: true, data: { id: user.id, email: user.email, status: user.status } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const { new_password } = ChangePasswordSchema.parse(req.body);
    await userService.changePassword(userId, new_password);
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    await userService.deleteUser(userId);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
