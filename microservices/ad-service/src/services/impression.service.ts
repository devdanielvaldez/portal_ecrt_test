import { AppDataSource } from '../config/data-source';
import { AdImpression } from '../entities/AdImpression';
import { Ad } from '../entities/Ad';

const impRepo = AppDataSource.getRepository(AdImpression);
const adRepo = AppDataSource.getRepository(Ad);

export const registerImpression = async (terminalId: string, data: any) => {
  const impression = impRepo.create({
    ...data,
    terminal_id: terminalId,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
  });
  return await impRepo.save(impression);
};

export const getDashboardMetrics = async (filters: any, userRole: string, userOrgId: string | null) => {
  const qb = impRepo.createQueryBuilder('imp')
    .innerJoin(Ad, 'ad', 'ad.id = imp.ad_id');
  if (userRole === 'ORG_USER') {
    qb.andWhere('ad.organization_id = :orgId', { orgId: userOrgId });
  } else if (filters.organization_id) {
    qb.andWhere('ad.organization_id = :orgId', { orgId: filters.organization_id });
  }
  if (filters.advertiser_id) qb.andWhere('ad.advertiser_id = :advId', { advId: filters.advertiser_id });
  if (filters.start_date) qb.andWhere('imp.timestamp >= :start', { start: filters.start_date });
  if (filters.end_date) qb.andWhere('imp.timestamp <= :end', { end: filters.end_date });
  const kpis = await qb.select('COUNT(imp.id)', 'total_views')
    .addSelect('COUNT(DISTINCT imp.terminal_id)', 'unique_screens')
    .getRawOne();
  const chartQuery = qb.clone();
  const trend = await chartQuery
    .select(`DATE_TRUNC('${filters.group_by}', imp.timestamp)`, 'date')
    .addSelect('COUNT(imp.id)', 'views')
    .groupBy('date')
    .orderBy('date', 'ASC')
    .getRawMany();
  const topAdsQuery = qb.clone();
  const topAds = await topAdsQuery
    .select('ad.id', 'ad_id')
    .addSelect('ad.name', 'ad_name')
    .addSelect('COUNT(imp.id)', 'views')
    .groupBy('ad.id')
    .addGroupBy('ad.name')
    .orderBy('views', 'DESC')
    .limit(5)
    .getRawMany();
  return {
    summary: {
      total_views: parseInt(kpis.total_views || '0'),
      unique_screens: parseInt(kpis.unique_screens || '0')
    },
    trend_chart: trend,
    top_performing_ads: topAds
  };
};

export const getHeatmapData = async (adId: string) => {
  const points = await impRepo.createQueryBuilder('imp')
    .select(['imp.latitude', 'imp.longitude'])
    .where('imp.ad_id = :adId', { adId })
    .andWhere('imp.latitude IS NOT NULL')
    .getRawMany();
  return points;
};
