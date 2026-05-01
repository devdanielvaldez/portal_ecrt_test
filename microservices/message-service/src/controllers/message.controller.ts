import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as msgService from '../services/message.service';
import { SendMessageSchema, UpdateMessageSchema } from '../schemas/message.schema';

export const createMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = SendMessageSchema.parse(req.body);
    const result = await msgService.sendMessage(data);
    res.status(201).json({ success: true, message: 'Message sent', data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: error.errors }); return; }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const pollMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: terminalId, organization_id: orgId } = req.user;
    const groupId = req.headers['x-group-id'] as string || null;
    const messages = await msgService.pullMessagesForTerminal(terminalId, orgId, groupId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) { res.status(500).json({ error: 'Error fetching messages' }); }
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = UpdateMessageSchema.parse(req.body);
    const result = await msgService.updateMessageStatus(req.params.id, status);
    res.status(200).json({ success: true, message: `Message status updated to ${status}`, data: result });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};
