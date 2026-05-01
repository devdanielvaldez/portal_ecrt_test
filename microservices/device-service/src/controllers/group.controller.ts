import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateGroupSchema, UpdateGroupSchema } from '../schemas/group.schema';
import * as groupService from '../services/group.service';

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = CreateGroupSchema.parse(req.body);
    if (req.user.role === 'ORG_USER') data.organization_id = req.user.organization_id;
    const result = await groupService.createGroup(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user.role === 'ORG_USER' ? req.user.organization_id : (req.query.organization_id as string);
    const result = await groupService.getGroups(orgId);
    res.status(200).json({ success: true, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getGroupById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await groupService.getGroupById(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Group not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = UpdateGroupSchema.parse(req.body);
    const result = await groupService.updateGroup(req.params.id as string, data);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Group not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await groupService.deleteGroup(req.params.id as string);
    res.status(200).json({ success: true, message: 'Group deleted' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Group not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};
