import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Organization } from '../entities/Organization';
import { CreateOrgSchema, UpdateOrgSchema } from '../schemas/org.schema';
import * as orgService from '../services/org.service';

const orgRepo = AppDataSource.getRepository(Organization);

export const createOrg = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = CreateOrgSchema.parse(req.body);
    const result = await orgService.createOrganization(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    if (error.message === 'AUTH_USER_CREATION_FAILED') { res.status(502).json({ error: 'User creation failed in auth service' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrgs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status } = req.query;
    const orgs = await orgService.getOrganizations(type as string, status as string);
    res.status(200).json({ success: true, data: orgs });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getOrgById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = await orgService.getOrganizationById(req.params.id);
    res.status(200).json({ success: true, data: org });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Organization not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrg = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = UpdateOrgSchema.parse(req.body);
    const updated = await orgService.updateOrganization(req.params.id, data);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Organization not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrg = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await orgService.deleteOrganization(req.params.id);
    res.status(200).json({ success: true, message: 'Organization deleted' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Organization not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};
