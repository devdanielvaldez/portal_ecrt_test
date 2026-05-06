import { z } from 'zod';

export const SignUpSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().length(10),
  email: z.string().email().max(100),
  password: z.string().min(8).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
  organization_id: z.string().uuid().optional()
});

export const SignInSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().length(10).optional(),
  password: z.string().min(1)
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided"
});

export const ForgetPasswordSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().length(10).optional()
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided"
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(8).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
});

export const DeviceLoginSchema = z.object({
  serial_number: z.string().min(5),
  password: z.string().min(6)
});
