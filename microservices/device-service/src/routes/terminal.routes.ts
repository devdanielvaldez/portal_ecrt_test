import { Router } from 'express';
import { createTerminal, getTerminals, getTerminalById, updateTerminal, deleteTerminal, deactivateTerminal } from '../controllers/terminal.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.get('/', requireAuth, getTerminals);
router.get('/:id', requireAuth, getTerminalById);
router.put('/:id', requireAuth, updateTerminal);
router.post('/', requireAdmin, createTerminal);
router.delete('/:id', requireAdmin, deleteTerminal);
router.patch('/:id/deactivate', requireAdmin, deactivateTerminal);

export default router;
