import { AppDataSource } from '../config/data-source';
import { Terminal } from '../entities/Terminal';
import { FilterTerminalDTO, UpdateTerminalDTO } from '../schemas/terminal.schema';

const terminalRepo = AppDataSource.getRepository(Terminal);

export const createTerminal = async (data: any) => {
  const existing = await terminalRepo.findOneBy({ serial_number: data.serial_number });
  if (existing) throw new Error('SERIAL_NUMBER_EXISTS');
  const rawPassword = Math.random().toString(36).slice(-8).toUpperCase();
  const terminal = new Terminal();
  terminalRepo.merge(terminal, data);
  await terminal.setDevicePassword(rawPassword);
  await terminalRepo.save(terminal);
  return { ...terminal, raw_device_password: rawPassword };
};

export const getTerminals = async (filters: FilterTerminalDTO) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;
  const qb = terminalRepo.createQueryBuilder('terminal');
  if (filters.organization_id) {
    const orgIds = filters.organization_id.split(',');
    qb.andWhere('terminal.organization_id IN (:...orgIds)', { orgIds });
  }
  if (filters.group_id) qb.andWhere('terminal.group_id = :groupId', { groupId: filters.group_id });
  if (filters.status) qb.andWhere('terminal.status = :status', { status: filters.status });
  if (filters.is_claimed) qb.andWhere('terminal.is_claimed = :isClaimed', { isClaimed: filters.is_claimed === 'true' });
  if (filters.search) {
    qb.andWhere('(terminal.name ILIKE :search OR terminal.serial_number ILIKE :search)', { search: `%${filters.search}%` });
  }
  qb.orderBy('terminal.created_at', 'DESC').skip(skip).take(limit);
  const [terminals, total] = await qb.getManyAndCount();
  return { terminals, meta: { total_items: total, current_page: page, total_pages: Math.ceil(total / limit) } };
};

export const getTerminalById = async (id: string) => {
  const terminal = await terminalRepo.findOneBy({ id });
  if (!terminal) throw new Error('TERMINAL_NOT_FOUND');
  return terminal;
};

export const updateTerminal = async (id: string, data: UpdateTerminalDTO) => {
  const terminal = await terminalRepo.findOneBy({ id });
  if (!terminal) throw new Error('TERMINAL_NOT_FOUND');
  terminalRepo.merge(terminal, data);
  return await terminalRepo.save(terminal);
};

export const deleteTerminal = async (id: string) => {
  const terminal = await terminalRepo.findOneBy({ id });
  if (!terminal) throw new Error('TERMINAL_NOT_FOUND');
  await terminalRepo.softRemove(terminal);
  return true;
};

export const deactivateTerminal = async (id: string) => {
  const terminal = await terminalRepo.findOneBy({ id });
  if (!terminal) throw new Error('TERMINAL_NOT_FOUND');
  terminal.status = 'INACTIVE';
  return await terminalRepo.save(terminal);
};
