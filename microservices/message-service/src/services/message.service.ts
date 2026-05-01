import { AppDataSource, redisClient } from '../config/data-source';
import { TerminalMessage, MessageType } from '../entities/Message';

const msgRepo = AppDataSource.getRepository(TerminalMessage);

export const sendMessage = async (data: any) => {
  const message: any = msgRepo.create(data);
  await msgRepo.save(message);
  if (message.type === MessageType.FLASH) {
    await redisClient.lPush('flash_messages', JSON.stringify(message));
  }
  return message;
};

export const pullMessagesForTerminal = async (terminalId: string, orgId: string, groupId: string | null) => {
  const qb = msgRepo.createQueryBuilder('msg')
    .where('msg.status = :status', { status: 'ACTIVE' })
    .andWhere('msg.type = :type', { type: MessageType.STICKY })
    .andWhere(`(
      msg.terminal_id = :terminalId OR 
      msg.group_id = :groupId OR 
      msg.organization_id = :orgId OR 
      (msg.terminal_id IS NULL AND msg.group_id IS NULL AND msg.organization_id IS NULL)
    )`, { terminalId, groupId, orgId });
  const stickyMessages = await qb.getMany();
  const flashList = await redisClient.lRange('flash_messages', 0, -1);
  let flashMessages = flashList.map(msg => JSON.parse(msg));
  flashMessages = flashMessages.filter(msg => {
    return msg.terminal_id === terminalId ||
           msg.group_id === groupId ||
           msg.organization_id === orgId ||
           (!msg.terminal_id && !msg.group_id && !msg.organization_id);
  });
  return [...stickyMessages, ...flashMessages];
};

export const updateMessageStatus = async (id: string, status: string) => {
  const msg = await msgRepo.findOneBy({ id });
  if (!msg) throw new Error('NOT_FOUND');
  msg.status = status;
  return await msgRepo.save(msg);
};
