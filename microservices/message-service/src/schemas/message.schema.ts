import { z } from 'zod';

export const SendMessageSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  type: z.enum(['FLASH', 'STICKY']).default('FLASH'),
  duration_seconds: z.number().min(1).default(10),
  organization_id: z.string().uuid().optional().nullable(),
  group_id: z.string().uuid().optional().nullable(),
  terminal_id: z.string().uuid().optional().nullable()
});

export const UpdateMessageSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'])
});
