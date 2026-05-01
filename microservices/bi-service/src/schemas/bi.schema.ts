import { z } from 'zod';

export const BIFilterSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  organization_id: z.string().uuid().optional(),
  terminal_id: z.string().uuid().optional(),
  group_id: z.string().uuid().optional(),
  time_group: z.enum(['day', 'week', 'month', 'year']).default('day')
});
export type BIFilterDTO = z.infer<typeof BIFilterSchema>;
