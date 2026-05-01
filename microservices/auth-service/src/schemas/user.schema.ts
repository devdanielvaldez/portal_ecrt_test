import { z } from 'zod';

export const CreateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const CreateOrgUserSchema = z.object({
  email: z.string().email(),
  organization_id: z.string().uuid()
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const ChangePasswordSchema = z.object({
  new_password: z.string().min(6)
});
export type CreateAdminDTO = z.infer<typeof CreateAdminSchema>;
export type CreateOrgUserDTO = z.infer<typeof CreateOrgUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
