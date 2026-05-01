import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as assignService from '../services/assignment.service';
import { AssignAdSchema } from '../schemas/assignment.schema';

export const assignAdsToNetwork = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ad_id, terminal_ids, group_ids } = AssignAdSchema.parse(req.body);
    await assignService.assignAds(ad_id, terminal_ids, group_ids);
    res.status(200).json({ success: true, message: 'Ad distributed successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    if (error.message === 'AD_NOT_FOUND') { res.status(404).json({ error: 'Ad not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const syncTerminalAds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const terminalId = req.user.id;
    const groupId = req.headers['x-group-id'] as string || null;
    const ads = await assignService.getAdsForTerminal(terminalId, groupId);
    res.status(200).json({ success: true, data: ads });
  } catch (error) { res.status(500).json({ error: 'Error syncing ads' }); }
};
