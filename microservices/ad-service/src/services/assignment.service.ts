import { AppDataSource } from '../config/data-source';
import { AdAssignment } from '../entities/AdAssignment';
import { Ad, AdStatus } from '../entities/Ad';
import { In } from 'typeorm';

const assignRepo = AppDataSource.getRepository(AdAssignment);
const adRepo = AppDataSource.getRepository(Ad);

export const assignAds = async (adId: string, terminalIds?: string[], groupIds?: string[]) => {
  const ad = await adRepo.findOneBy({ id: adId });
  if (!ad) throw new Error('AD_NOT_FOUND');
  const assignments: any[] = [];
  if (terminalIds) {
    terminalIds.forEach(tid => assignments.push({ ad_id: adId, terminal_id: tid }));
  }
  if (groupIds) {
    groupIds.forEach(gid => assignments.push({ ad_id: adId, group_id: gid }));
  }
  await assignRepo.save(assignments);
  return true;
};

export const getAdsForTerminal = async (terminalId: string, groupId: string | null) => {
  const query = assignRepo.createQueryBuilder('assign')
    .select('assign.ad_id')
    .where('assign.terminal_id = :terminalId', { terminalId });
  if (groupId) {
    query.orWhere('assign.group_id = :groupId', { groupId });
  }
  const assignments = await query.getMany();
  const adIds = assignments.map(a => a.ad_id);
  if (adIds.length === 0) return [];
  const ads = await adRepo.find({
    where: { id: In(adIds), status: AdStatus.ACTIVE },
    select: ['id', 'name', 'media_url', 'media_type', 'is_all_day', 'start_time', 'end_time', 'days_of_week']
  });
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const validAdsToday = ads.filter(ad => {
    if (ad.days_of_week && ad.days_of_week.length > 0) {
      return ad.days_of_week.includes(todayStr);
    }
    return true;
  });
  return validAdsToday;
};
