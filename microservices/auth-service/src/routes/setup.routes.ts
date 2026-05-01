import { Router } from 'express';
import { createAdmin } from '../controllers/setup.controller';
import { requireMasterKey } from '../middlewares/setup.middleware';

const router = Router();
router.post('/admin', requireMasterKey, createAdmin);

export default router;
