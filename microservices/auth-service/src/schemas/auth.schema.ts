import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const DeviceLoginSchema = z.object({
  serial_number: z.string().min(5),
  password: z.string().min(6)
});
export type LoginDTO = z.infer<typeof LoginSchema>;
export type DeviceLoginDTO = z.infer<typeof DeviceLoginSchema>;
