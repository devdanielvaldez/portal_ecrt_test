import { z } from 'zod';

export const SecureUrlSchema = z.object({
  file_path: z.string().min(1)
});
export type SecureUrlDTO = z.infer<typeof SecureUrlSchema>;
