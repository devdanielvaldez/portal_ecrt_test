import { z } from 'zod';

export const CreateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
    'La contraseña debe contener mayúscula, minúscula y número'
  )
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
