import { Router } from 'express';
import { assignCommerces, getAgencyCommerces, getNetworkGraph, unassignCommerce } from '../controllers/agency.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAdmin);
router.post('/assign', assignCommerces);
router.post('/unassign', unassignCommerce);
router.get('/network-graph', getNetworkGraph);
router.get('/:id/commerces', getAgencyCommerces);

export default router;
