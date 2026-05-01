import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AssignCommerceSchema, UnassignCommerceSchema } from '../schemas/agency.schema';
import * as agencyService from '../services/agency.service';

export const assignCommerces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agency_id, commerce_ids } = AssignCommerceSchema.parse(req.body);
    await agencyService.assignCommerces(agency_id, commerce_ids);
    res.status(200).json({ success: true, message: 'Commerces assigned' });
  } catch (error: any) {
    if (error.message === 'AGENCY_NOT_FOUND') { res.status(404).json({ error: 'Agency not found' }); return; }
    if (error.message === 'INVALID_COMMERCES') { res.status(400).json({ error: 'Some commerces are invalid' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignCommerce = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agency_id, commerce_id } = UnassignCommerceSchema.parse(req.body);
    await agencyService.unassignCommerce(agency_id, commerce_id);
    res.status(200).json({ success: true, message: 'Commerce unassigned' });
  } catch (error: any) {
    if (error.message === 'ASSIGNMENT_NOT_FOUND') { res.status(404).json({ error: 'Assignment not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAgencyCommerces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commerces = await agencyService.getAgencyCommerces(req.params.id as string);
    res.status(200).json({ success: true, data: commerces });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getNetworkGraph = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const graph = await agencyService.getNetworkGraph();
    res.status(200).json({ success: true, data: graph });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
