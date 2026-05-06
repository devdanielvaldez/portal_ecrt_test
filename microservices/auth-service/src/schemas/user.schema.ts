import { z } from 'zod';

export const CreateAdminSchema = z.object({
  email: z.string().email()
});

export const CreateOrgUserSchema = z.object({
  email: z.string().email(),
  organization_id: z.string().uuid()
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const ChangePasswordLocalSchema = z.object({
  new_password: z.string().min(6)
});
