import { z } from 'zod';

export const AssignAdSchema = z.object({
  ad_id: z.string().uuid(),
  terminal_ids: z.array(z.string().uuid()).optional(),
  group_ids: z.array(z.string().uuid()).optional()
}).refine(data => {
  const hasTerminals = data.terminal_ids && data.terminal_ids.length > 0;
  const hasGroups = data.group_ids && data.group_ids.length > 0;
  return hasTerminals || hasGroups;
}, "Must provide terminal_ids or group_ids");
