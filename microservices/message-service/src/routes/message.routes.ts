import { Router } from 'express';
import { createMessage, pollMessages, updateStatus } from '../controllers/message.controller';
import { requireAdmin, requireDevice } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pull', requireDevice, pollMessages);
router.post('/send', requireAdmin, createMessage);
router.patch('/:id/status', requireAdmin, updateStatus);

export default router;
