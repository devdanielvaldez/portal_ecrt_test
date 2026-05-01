import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(2),
  organization_id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});
