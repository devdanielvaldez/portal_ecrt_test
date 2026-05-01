import { Router } from 'express';
import { createOrg, getOrgs, getOrgById, updateOrg, deleteOrg } from '../controllers/org.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token' }); }
};

router.get('/', requireAuth, getOrgs);
router.get('/:id', requireAuth, getOrgById);
router.post('/', requireAdmin, createOrg);
router.put('/:id', requireAdmin, updateOrg);
router.delete('/:id', requireAdmin, deleteOrg);

export default router;
