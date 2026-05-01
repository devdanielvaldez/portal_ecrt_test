import { Router } from 'express';
import { sendTelemetry, getTerminalMonitor, getFleetMonitor } from '../controllers/telemetry.controller';
import { requireDevice } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.post('/ping', requireDevice, sendTelemetry);
router.get('/fleet', requireAuth, getFleetMonitor);
router.get('/:id/live', requireAuth, getTerminalMonitor);

export default router;
