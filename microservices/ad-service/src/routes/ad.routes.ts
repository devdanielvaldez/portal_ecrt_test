import { Router } from 'express';
import * as adController from '../controllers/ad.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAdmin, adController.createAd);
router.get('/', requireAdmin, adController.getAds);
router.get('/:id', requireAdmin, adController.getAdById);
router.post('/:id/review', requireAdmin, adController.reviewAd);
router.delete('/:id', requireAdmin, adController.deleteAd);

export default router;
