import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateTerminalSchema, FilterTerminalSchema, UpdateTerminalSchema } from '../schemas/terminal.schema';
import * as terminalService from '../services/terminal.service';

export const createTerminal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = CreateTerminalSchema.parse(req.body);
    const result = await terminalService.createTerminal(validatedData);
    res.status(201).json({ success: true, message: 'Terminal created', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    if (error.message === 'SERIAL_NUMBER_EXISTS') { res.status(409).json({ error: 'Serial number already exists' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTerminals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = FilterTerminalSchema.parse(req.query);
    const result = await terminalService.getTerminals(filters);
    res.status(200).json({ success: true, data: result.terminals, meta: result.meta });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getTerminalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await terminalService.getTerminalById(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'TERMINAL_NOT_FOUND') { res.status(404).json({ error: 'Terminal not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTerminal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = UpdateTerminalSchema.parse(req.body);
    const result = await terminalService.updateTerminal(req.params.id, data);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'TERMINAL_NOT_FOUND') { res.status(404).json({ error: 'Terminal not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTerminal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await terminalService.deleteTerminal(req.params.id);
    res.status(200).json({ success: true, message: 'Terminal deleted' });
  } catch (error: any) {
    if (error.message === 'TERMINAL_NOT_FOUND') { res.status(404).json({ error: 'Terminal not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deactivateTerminal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await terminalService.deactivateTerminal(req.params.id);
    res.status(200).json({ success: true, message: 'Terminal deactivated' });
  } catch (error: any) {
    if (error.message === 'TERMINAL_NOT_FOUND') { res.status(404).json({ error: 'Terminal not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};
