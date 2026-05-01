import { Router } from 'express';
import { createAdvertiser, getMyAdvertisers, updateAdvertiser, deleteAdvertiser } from '../controllers/advertiser.controller';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.use(requireAuth);
router.post('/', createAdvertiser);
router.get('/', getMyAdvertisers);
router.put('/:id', updateAdvertiser);
router.delete('/:id', deleteAdvertiser);

export default router;
