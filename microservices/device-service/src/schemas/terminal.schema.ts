import { z } from 'zod';

export const CreateTerminalSchema = z.object({
  name: z.string().min(2),
  serial_number: z.string().min(5),
  organization_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('INACTIVE')
});

export const UpdateTerminalSchema = z.object({
  name: z.string().min(2).optional(),
  organization_id: z.string().uuid().optional().nullable(),
  group_id: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const FilterTerminalSchema = z.object({
  organization_id: z.string().optional(),
  group_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  is_claimed: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("20")
});
