import { Router } from 'express';
import { getDashboard } from '../controllers/bi.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.get('/master', requireAuth, getDashboard);

export default router;
