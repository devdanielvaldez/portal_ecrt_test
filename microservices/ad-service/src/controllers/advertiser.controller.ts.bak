import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as advService from '../services/advertiser.service';
import { CreateAdvertiserSchema, UpdateAdvertiserSchema } from '../schemas/advertiser.schema';

export const createAdvertiser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = CreateAdvertiserSchema.parse(req.body);
    if (req.user.role === 'ORG_USER') {
      data.organization_id = req.user.organization_id;
    } else if (!data.organization_id) {
      res.status(400).json({ error: 'Admins must provide organization_id' });
      return;
    }
    const result = await advService.createAdvertiser(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    if (error.message === 'DUPLICATE_NAME') { res.status(409).json({ error: 'Advertiser name already exists in this organization' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyAdvertisers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user.role === 'ORG_USER' ? req.user.organization_id : req.query.organization_id as string;
    if (!orgId) { res.status(400).json({ error: 'Missing organization_id' }); return; }
    const advertisers = await advService.getAdvertisers(orgId, req.query.status as string);
    res.status(200).json({ success: true, data: advertisers });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const updateAdvertiser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = UpdateAdvertiserSchema.parse(req.body);
    const result = await advService.updateAdvertiser(req.params.id as string as string, data);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Advertiser not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAdvertiser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await advService.deleteAdvertiser(req.params.id as string as string);
    res.status(200).json({ success: true, message: 'Advertiser deleted' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Advertiser not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};
