import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as impService from '../services/impression.service';
import { CreateImpressionSchema, DashboardFilterSchema } from '../schemas/impression.schema';

export const logImpression = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const terminalId = req.user.id;
    const data = CreateImpressionSchema.parse(req.body);
    await impService.registerImpression(terminalId, data);
    res.status(202).json({ success: true, message: 'Impression logged' });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = DashboardFilterSchema.parse(req.query);
    const metrics = await impService.getDashboardMetrics(filters, req.user.role, req.user.organization_id);
    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHeatmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const points = await impService.getHeatmapData(req.params.adId as string as string);
    res.status(200).json({ success: true, data: points });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
