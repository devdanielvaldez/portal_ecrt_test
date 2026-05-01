import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { createOrgUser, getOrgUsers, updateUser, changePassword, deleteUser } from '../controllers/user.controller';

const router = Router();
router.use(requireAdmin);
router.post('/', createOrgUser);
router.get('/organization/:orgId', getOrgUsers);
router.put('/:id', updateUser);
router.patch('/:id/password', changePassword);
router.delete('/:id', deleteUser);

export default router;
