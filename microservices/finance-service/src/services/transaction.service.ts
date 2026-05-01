import { AppDataSource } from '../config/data-source';
import { Transaction } from '../entities/Transaction';

const txRepo = AppDataSource.getRepository(Transaction);

export const registerTransaction = async (terminalId: string, orgId: string, data: any) => {
  const tx = txRepo.create({ ...data, terminal_id: terminalId, organization_id: orgId });
  return await txRepo.save(tx);
};

export const getTransactionsList = async (filters: any, userRole: string, userOrgId: string | null) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "50");
  const skip = (page - 1) * limit;
  const qb = txRepo.createQueryBuilder('tx');
  if (userRole === 'ORG_USER') qb.andWhere('tx.organization_id = :orgId', { orgId: userOrgId });
  else if (filters.organization_id) qb.andWhere('tx.organization_id = :orgId', { orgId: filters.organization_id });
  if (filters.terminal_id) qb.andWhere('tx.terminal_id = :termId', { termId: filters.terminal_id });
  if (filters.payment_method) qb.andWhere('tx.payment_method = :method', { method: filters.payment_method });
  if (filters.card_brand) qb.andWhere('tx.card_brand = :brand', { brand: filters.card_brand });
  if (filters.min_amount) qb.andWhere('tx.amount >= :min', { min: filters.min_amount });
  if (filters.max_amount) qb.andWhere('tx.amount <= :max', { max: filters.max_amount });
  if (filters.start_date) qb.andWhere('tx.created_at >= :start', { start: filters.start_date });
  if (filters.end_date) qb.andWhere('tx.created_at <= :end', { end: filters.end_date });
  qb.orderBy('tx.created_at', 'DESC').skip(skip).take(limit);
  const [transactions, total] = await qb.getManyAndCount();
  return { transactions, meta: { total_items: total, current_page: page, total_pages: Math.ceil(total / limit) } };
};

export const getFinancialDashboard = async (filters: any, userRole: string, userOrgId: string | null) => {
  const qb = txRepo.createQueryBuilder('tx');
  if (userRole === 'ORG_USER') qb.andWhere('tx.organization_id = :orgId', { orgId: userOrgId });
  else if (filters.organization_id) qb.andWhere('tx.organization_id = :orgId', { orgId: filters.organization_id });
  if (filters.start_date) qb.andWhere('tx.created_at >= :start', { start: filters.start_date });
  if (filters.end_date) qb.andWhere('tx.created_at <= :end', { end: filters.end_date });
  const summary = await qb.select('SUM(tx.amount)', 'total_revenue')
    .addSelect('COUNT(tx.id)', 'total_transactions')
    .addSelect('AVG(tx.amount)', 'average_ticket')
    .getRawOne();
  const byBrand = await qb.clone()
    .select('tx.card_brand', 'brand')
    .addSelect('SUM(tx.amount)', 'revenue')
    .addSelect('COUNT(tx.id)', 'transactions')
    .groupBy('tx.card_brand')
    .getRawMany();
  const trend = await qb.clone()
    .select(`DATE_TRUNC('day', tx.created_at)`, 'date')
    .addSelect('SUM(tx.amount)', 'revenue')
    .groupBy('date')
    .orderBy('date', 'ASC')
    .getRawMany();
  return {
    summary: {
      total_revenue: parseFloat(summary.total_revenue || '0'),
      total_transactions: parseInt(summary.total_transactions || '0'),
      average_ticket: parseFloat(summary.average_ticket || '0')
    },
    revenue_by_brand: byBrand,
    revenue_trend: trend
  };
};
