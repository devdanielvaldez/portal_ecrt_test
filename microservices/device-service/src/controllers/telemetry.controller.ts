import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TelemetrySchema } from '../schemas/telemetry.schema';
import * as telemetryService from '../services/telemetry.service';

export const sendTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = TelemetrySchema.parse(req.body);
    await telemetryService.ingestTelemetry(data);
    res.status(202).json({ success: true, message: 'Telemetry received' });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    if (error.message === 'TERMINAL_INACTIVE_OR_NOT_FOUND') { res.status(403).json({ error: 'Terminal inactive or not found' }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTerminalMonitor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await telemetryService.getLiveTerminalStatus(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

export const getFleetMonitor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const serialNumbers = req.query.serial_numbers as string;
    if (!serialNumbers) { res.status(400).json({ error: 'Missing serial_numbers param' }); return; }
    const result = await telemetryService.getLiveFleetStatus(serialNumbers.split(','));
    res.status(200).json({ success: true, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
