import { Router } from 'express';
import { processTransaction, getTransactions, getDashboard } from '../controllers/transaction.controller';
import { requireDevice } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.get('/', requireAuth, getTransactions);
router.get('/dashboard', requireAuth, getDashboard);
router.post('/', requireDevice, processTransaction);

export default router;
