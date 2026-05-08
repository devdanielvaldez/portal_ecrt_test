import { logger } from './logger';

export type AuditAction = string;

export const audit = (
  action: AuditAction,
  userId: string | null,
  organizationId: string | null,
  details: Record<string, any>,
  result: 'SUCCESS' | 'FAILURE',
  ip?: string,
) => {
  logger.info({
    event: 'audit',
    action,
    user_id: userId,
    organization_id: organizationId,
    details,
    result,
    ip_address: ip,
  });
};
