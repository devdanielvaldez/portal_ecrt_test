import { AppDataSource } from '../config/data-source';
import { TerminalGroup } from '../entities/TerminalGroup';
import { Terminal } from '../entities/Terminal';

const groupRepo = AppDataSource.getRepository(TerminalGroup);
const terminalRepo = AppDataSource.getRepository(Terminal);

export const createGroup = async (data: any) => {
  const group = groupRepo.create(data);
  return await groupRepo.save(group);
};

export const getGroups = async (orgId?: string) => {
  const qb = groupRepo.createQueryBuilder('group');
  if (orgId) qb.where('group.organization_id = :orgId', { orgId });
  return await qb.getMany();
};

export const getGroupById = async (id: string) => {
  const group = await groupRepo.findOneBy({ id });
  if (!group) throw new Error('NOT_FOUND');
  return group;
};

export const updateGroup = async (id: string, data: any) => {
  const group = await groupRepo.findOneBy({ id });
  if (!group) throw new Error('NOT_FOUND');
  groupRepo.merge(group, data);
  return await groupRepo.save(group);
};

export const deleteGroup = async (id: string) => {
  const group = await groupRepo.findOneBy({ id });
  if (!group) throw new Error('NOT_FOUND');
  await terminalRepo.update({ group_id: id }, { group_id: null });
  await groupRepo.softRemove(group);
  return true;
};
