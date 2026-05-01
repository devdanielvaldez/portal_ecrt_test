import { z } from 'zod';

export const CreateImpressionSchema = z.object({
  ad_id: z.string().uuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timestamp: z.string().datetime().optional()
});

export const DashboardFilterSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  advertiser_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  group_by: z.enum(['day', 'week', 'month']).default('day')
});
export type CreateImpressionDTO = z.infer<typeof CreateImpressionSchema>;
export type DashboardFilterDTO = z.infer<typeof DashboardFilterSchema>;
