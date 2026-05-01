import { Router } from 'express';
import { loginAdmin, loginOrganization, loginDevice } from '../controllers/auth.controller';

const router = Router();
router.post('/login/admin', loginAdmin);
router.post('/login/organization', loginOrganization);
router.post('/login/device', loginDevice);

export default router;
