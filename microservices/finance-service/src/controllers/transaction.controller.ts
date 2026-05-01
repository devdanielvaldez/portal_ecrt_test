import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as txService from '../services/transaction.service';
import { CreateTransactionSchema, FilterTransactionSchema } from '../schemas/transaction.schema';

export const processTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = CreateTransactionSchema.parse(req.body);
    const { id: terminalId, organization_id: orgId } = req.user;
    const result = await txService.registerTransaction(terminalId, orgId, data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = FilterTransactionSchema.parse(req.query);
    const result = await txService.getTransactionsList(filters, req.user.role, req.user.organization_id);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await txService.getFinancialDashboard(req.query, req.user.role, req.user.organization_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
