import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as biService from '../services/bi.service';
import { BIFilterSchema } from '../schemas/bi.schema';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = BIFilterSchema.parse(req.query);
    if (req.user.role === 'ORG_USER') filters.organization_id = req.user.organization_id;
    const dashboardData = await biService.getMasterDashboard(filters);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
