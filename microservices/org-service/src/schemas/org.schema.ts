import { z } from 'zod';

export const CreateOrgSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['COMMERCE', 'AGENCY']),
  email: z.string().email(),
  phone: z.string().optional(),
  metadata: z.any().optional()
});

export const UpdateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  phone: z.string().optional(),
  metadata: z.any().optional()
});
export type CreateOrgDTO = z.infer<typeof CreateOrgSchema>;
export type UpdateOrgDTO = z.infer<typeof UpdateOrgSchema>;
