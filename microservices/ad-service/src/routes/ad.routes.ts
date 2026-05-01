import { Router } from 'express';
import { createAd, getAds, getAdById, reviewAd, deleteAd } from '../controllers/ad.controller';
import { assignAdsToNetwork, syncTerminalAds } from '../controllers/assignment.controller';
import { requireAdmin, requireDevice } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.use(requireAuth);
router.post('/', createAd);
router.get('/', getAds);
router.get('/:id', getAdById);
router.delete('/:id', deleteAd);
router.patch('/:id/review', requireAdmin, reviewAd);
router.post('/assign', requireAuth, assignAdsToNetwork);
router.get('/sync-my-ads', requireDevice, syncTerminalAds);

export default router;
