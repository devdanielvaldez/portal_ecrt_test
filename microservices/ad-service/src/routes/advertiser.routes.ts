import { Router } from 'express';
import * as advertiserController from '../controllers/advertiser.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAdmin, advertiserController.createAdvertiser);
router.get('/', requireAdmin, advertiserController.getMyAdvertisers);
router.patch('/:id', requireAdmin, advertiserController.updateAdvertiser);
router.delete('/:id', requireAdmin, advertiserController.deleteAdvertiser);

export default router;
