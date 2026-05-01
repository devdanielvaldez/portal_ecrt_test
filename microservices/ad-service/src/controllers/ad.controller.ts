import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as adService from '../services/ad.service';
import { CreateAdSchema, FilterAdSchema, ReviewAdSchema } from '../schemas/ad.schema';

export const createAd = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = CreateAdSchema.parse(req.body);
    const adData = {
      ...data,
      organization_id: req.user.role === 'ORG_USER' ? req.user.organization_id : req.body.organization_id
    };
    if (!adData.organization_id) { res.status(400).json({ error: 'Missing organization_id' }); return; }
    const result = await adService.createAd(adData);
    res.status(201).json({ success: true, message: 'Ad created (pending approval)', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = FilterAdSchema.parse(req.query);
    const result = await adService.getAds(filters, req.user.role, req.user.organization_id);
    res.status(200).json({ success: true, data: result.ads, meta: result.meta });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getAdById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adService.getAdById(req.params.id as string as string);
    if (req.user.role === 'ORG_USER' && result.organization_id !== req.user.organization_id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') { res.status(404).json({ error: 'Ad not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reviewAd = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = ReviewAdSchema.parse(req.body);
    const result = await adService.updateAdStatus(req.params.id as string as string, status);
    res.status(200).json({ success: true, message: `Ad marked as ${status}`, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const deleteAd = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await adService.deleteAd(req.params.id as string as string);
    res.status(200).json({ success: true, message: 'Ad deleted' });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
