import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';
import { CreateOrgUserSchema, UpdateUserSchema, ChangePasswordLocalSchema } from '../schemas/user.schema';

export const createOrgUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, organization_id } = CreateOrgUserSchema.parse(req.body);
    const result = await userService.createOrgUser(email, organization_id);
    const user = result.user;
    res.status(201).json({ success: true, data: { user } });
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
    const { new_password } = ChangePasswordLocalSchema.parse(req.body);
    await userService.changePasswordLocal(userId, new_password);
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    await userService.deleteUser(userId);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
