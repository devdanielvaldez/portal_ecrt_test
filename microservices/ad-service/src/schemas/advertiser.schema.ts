import { z } from 'zod';

export const CreateAdvertiserSchema = z.object({
  name: z.string().min(2),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  organization_id: z.string().uuid().optional()
});

export const UpdateAdvertiserSchema = z.object({
  name: z.string().min(2).optional(),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});
