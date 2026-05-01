import { Router } from 'express';
import { encryptHandler, decryptHandler } from '../controllers/crypto.controller';

const router = Router();
router.post('/encrypt', encryptHandler);
router.post('/decrypt', decryptHandler);

export default router;
