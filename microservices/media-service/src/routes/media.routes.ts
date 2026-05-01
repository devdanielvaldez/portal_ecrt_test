import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadMedia, getSecurePlaybackUrl } from '../controllers/media.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireValidSignature } from '../middlewares/signature.middleware';
import { cryptoMiddleware } from '../middlewares/crypto.middleware';
import fs from 'fs';

const upload = multer({ dest: 'tmp/' });
const router = Router();

const USE_S3 = process.env.USE_S3 === 'true';

router.get('/private/*', requireValidSignature, async (req: any, res: any) => {
  const filePath = req.params[0];
  if (USE_S3) {
    const { getPublicUrl } = await import('../services/storage.service');
    const url = await getPublicUrl(filePath, 300);
    return res.redirect(url);
  } else {
    const physicalPath = path.join(__dirname, '../../uploads', filePath);
    if (!fs.existsSync(physicalPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    return res.sendFile(physicalPath);
  }
});

router.post('/upload', requireAuth, upload.single('file'), uploadMedia);
router.post('/secure-url', requireAuth, getSecurePlaybackUrl);

export default router;
