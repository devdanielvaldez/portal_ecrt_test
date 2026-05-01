import { z } from 'zod';

export const EncryptRequestSchema = z.object({
  data: z.any()
});

export const DecryptRequestSchema = z.object({
  payload: z.string()
});
