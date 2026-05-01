import { AppDataSource } from '../config/data-source';
import { Ad } from '../entities/Ad';

const adRepo = AppDataSource.getRepository(Ad);

export const createAd = async (data: any) => {
  const ad = adRepo.create(data);
  return await adRepo.save(ad);
};

export const getAds = async (filters: any, userRole: string, userOrgId: string | null) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;
  const qb = adRepo.createQueryBuilder('ad');
  if (userRole === 'ORG_USER') {
    qb.andWhere('ad.organization_id = :orgId', { orgId: userOrgId });
  } else if (filters.organization_id) {
    qb.andWhere('ad.organization_id = :orgId', { orgId: filters.organization_id });
  }
  if (filters.advertiser_id) qb.andWhere('ad.advertiser_id = :advId', { advId: filters.advertiser_id });
  if (filters.status) qb.andWhere('ad.status = :status', { status: filters.status });
  if (filters.media_type) qb.andWhere('ad.media_type = :type', { type: filters.media_type });
  if (filters.search) {
    qb.andWhere('ad.name ILIKE :search', { search: `%${filters.search}%` });
  }
  qb.orderBy('ad.created_at', 'DESC').skip(skip).take(limit);
  const [ads, total] = await qb.getManyAndCount();
  return { ads, meta: { total_items: total, current_page: page, total_pages: Math.ceil(total / limit) } };
};

export const getAdById = async (id: string) => {
  const ad = await adRepo.findOneBy({ id });
  if (!ad) throw new Error('NOT_FOUND');
  return ad;
};

export const updateAdStatus = async (id: string, status: string) => {
  const ad = await adRepo.findOneBy({ id });
  if (!ad) throw new Error('NOT_FOUND');
  ad.status = status as any;
  return await adRepo.save(ad);
};

export const deleteAd = async (id: string) => {
  const ad = await adRepo.findOneBy({ id });
  if (!ad) throw new Error('NOT_FOUND');
  await adRepo.softRemove(ad);
  return true;
};
