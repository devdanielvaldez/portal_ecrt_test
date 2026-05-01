import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Terminal } from '../entities/Terminal';

const router = Router();

router.post('/validate-device', async (req: Request, res: Response): Promise<void> => {
  const { serial_number, password } = req.body;
  const terminalRepo = AppDataSource.getRepository(Terminal);
  const terminal = await terminalRepo.findOneBy({ serial_number });
  if (!terminal || !(await terminal.checkDevicePassword(password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  if (terminal.status !== 'ACTIVE') {
    res.status(403).json({ error: 'Terminal inactive' });
    return;
  }
  if (!terminal.is_claimed) {
    terminal.is_claimed = true;
    await terminalRepo.save(terminal);
  }
  res.json({ id: terminal.id, organization_id: terminal.organization_id });
});

export default router;
