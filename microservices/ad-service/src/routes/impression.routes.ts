import { Router } from 'express';
import * as impressionController from '../controllers/impression.controller';
import { requireAdmin, requireDevice } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireDevice, impressionController.logImpression);
router.get('/analytics', requireAdmin, impressionController.getAnalytics);
router.get('/heatmap/:adId', requireAdmin, impressionController.getHeatmap);

export default router;
