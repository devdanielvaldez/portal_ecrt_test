import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as mediaService from '../services/media.service';
import { SecureUrlSchema } from '../schemas/media.schema';

export const uploadMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const organizationId = req.user.role === 'ORG_USER' ? req.user.organization_id : req.body.organization_id;
    if (!organizationId) { res.status(400).json({ error: 'organization_id is required' }); return; }
    const result = await mediaService.processAndUpload(req.file, organizationId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'UNSUPPORTED_TYPE') { res.status(415).json({ error: 'Unsupported file type' }); return; }
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const getSecurePlaybackUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { file_path } = SecureUrlSchema.parse(req.body);
    const url = await mediaService.getSecurePlaybackUrl(file_path);
    res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Failed to generate secure URL' });
  }
};
