import { z } from 'zod';

export const CreateAdSchema = z.object({
  name: z.string().min(2),
  advertiser_id: z.string().uuid(),
  media_url: z.string().url(),
  media_type: z.enum(['IMAGE', 'VIDEO']),
  is_all_day: z.boolean().default(true),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  days_of_week: z.array(z.enum(['MON','TUE','WED','THU','FRI','SAT','SUN'])).optional()
}).refine(data => {
  if (!data.is_all_day && (!data.start_time || !data.end_time)) return false;
  return true;
}, "If not all day, start_time and end_time are required");

export const ReviewAdSchema = z.object({
  status: z.enum(['ACTIVE', 'REJECTED', 'INACTIVE'])
});

export const FilterAdSchema = z.object({
  organization_id: z.string().uuid().optional(),
  advertiser_id: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']).optional(),
  media_type: z.enum(['IMAGE', 'VIDEO']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("20")
});
