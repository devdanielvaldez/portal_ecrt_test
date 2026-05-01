import { AppDataSource } from '../config/data-source';
import { Advertiser } from '../entities/Advertiser';

const advRepo = AppDataSource.getRepository(Advertiser);

export const createAdvertiser = async (data: any) => {
  try {
    const adv = advRepo.create(data);
    return await advRepo.save(adv);
  } catch (error: any) {
    if (error.code === '23505') throw new Error('DUPLICATE_NAME');
    throw error;
  }
};

export const getAdvertisers = async (orgId: string, status?: string) => {
  const where: any = { organization_id: orgId };
  if (status) where.status = status;
  return await advRepo.find({ where, order: { name: 'ASC' } });
};

export const updateAdvertiser = async (id: string, data: any) => {
  const adv = await advRepo.findOneBy({ id });
  if (!adv) throw new Error('NOT_FOUND');
  advRepo.merge(adv, data);
  return await advRepo.save(adv);
};

export const deleteAdvertiser = async (id: string) => {
  const adv = await advRepo.findOneBy({ id });
  if (!adv) throw new Error('NOT_FOUND');
  await advRepo.softRemove(adv);
  return true;
};
