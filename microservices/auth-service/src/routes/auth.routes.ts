import { Router } from 'express';
import { signUp, signIn, forgetPassword, changePassword, loginDevice } from '../controllers/auth.controller';

const router = Router();
router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/forget-password', forgetPassword);
router.patch('/user/:id/password', changePassword);
router.post('/login/device', loginDevice);

export default router;
