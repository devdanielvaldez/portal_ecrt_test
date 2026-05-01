import { AppDataSource } from '../config/data-source';
import { BIFilterDTO } from '../schemas/bi.schema';

const applyFilters = (baseQuery: string, filters: BIFilterDTO, tableAlias: string = '') => {
  let query = baseQuery;
  const params: any[] = [];
  let paramIndex = 1;
  const prefix = tableAlias ? `${tableAlias}.` : '';
  if (filters.organization_id) { query += ` AND ${prefix}organization_id = $${paramIndex++}`; params.push(filters.organization_id); }
  if (filters.terminal_id) { query += ` AND ${prefix}terminal_id = $${paramIndex++}`; params.push(filters.terminal_id); }
  if (filters.start_date) { query += ` AND ${prefix}created_at >= $${paramIndex++}`; params.push(filters.start_date); }
  if (filters.end_date) { query += ` AND ${prefix}created_at <= $${paramIndex++}`; params.push(filters.end_date); }
  return { query, params };
};

export const getMasterDashboard = async (filters: BIFilterDTO) => {
  const manager = AppDataSource.manager;
  const { query: finQuery, params: finParams } = applyFilters(
    `SELECT COALESCE(SUM(amount), 0) as total_revenue, COUNT(id) as total_txs, COALESCE(AVG(amount), 0) as avg_ticket FROM transactions WHERE 1=1`, filters
  );
  const financeKPIs = await manager.query(finQuery, finParams);
  let adQuery = `SELECT COUNT(id) as total_impressions, COUNT(DISTINCT terminal_id) as active_screens FROM ad_impressions WHERE 1=1`;
  const adParams = [];
  let adIdx = 1;
  if (filters.terminal_id) { adQuery += ` AND terminal_id = $${adIdx++}`; adParams.push(filters.terminal_id); }
  if (filters.start_date) { adQuery += ` AND timestamp >= $${adIdx++}`; adParams.push(filters.start_date); }
  if (filters.end_date) { adQuery += ` AND timestamp <= $${adIdx++}`; adParams.push(filters.end_date); }
  const adKPIs = await manager.query(adQuery, adParams);
  const { query: trendQuery, params: trendParams } = applyFilters(
    `SELECT DATE_TRUNC('${filters.time_group}', created_at) as period, SUM(amount) as revenue, COUNT(id) as txs FROM transactions WHERE 1=1`, filters
  );
  const revenueTrend = await manager.query(`${trendQuery} GROUP BY period ORDER BY period ASC`, trendParams);
  const { query: topTermQuery, params: topTermParams } = applyFilters(
    `SELECT t.name as terminal_name, SUM(tx.amount) as total_revenue FROM transactions tx JOIN terminals t ON tx.terminal_id = t.id WHERE 1=1`, filters, 'tx'
  );
  const topTerminals = await manager.query(`${topTermQuery} GROUP BY t.id, t.name ORDER BY total_revenue DESC LIMIT 5`, topTermParams);
  const { query: methodQuery, params: methodParams } = applyFilters(
    `SELECT payment_method, SUM(amount) as revenue, COUNT(id) as count FROM transactions WHERE 1=1`, filters
  );
  const paymentMethods = await manager.query(`${methodQuery} GROUP BY payment_method`, methodParams);
  return {
    kpis: {
      revenue: parseFloat(financeKPIs[0].total_revenue),
      transactions: parseInt(financeKPIs[0].total_txs),
      average_ticket: parseFloat(financeKPIs[0].avg_ticket).toFixed(2),
      impressions: parseInt(adKPIs[0].total_impressions),
      active_screens: parseInt(adKPIs[0].active_screens)
    },
    charts: { revenue_trend: revenueTrend, payment_distribution: paymentMethods },
    rankings: { top_terminals: topTerminals }
  };
};
