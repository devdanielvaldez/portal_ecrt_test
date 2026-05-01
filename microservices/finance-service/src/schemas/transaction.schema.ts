import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  payment_method: z.enum(['CHIP', 'TAP', 'SWIPE']),
  card_brand: z.enum(['VISA', 'MASTERCARD', 'AMEX', 'SUBSIDIZED']),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const FilterTransactionSchema = z.object({
  organization_id: z.string().uuid().optional(),
  terminal_id: z.string().uuid().optional(),
  payment_method: z.enum(['CHIP', 'TAP', 'SWIPE']).optional(),
  card_brand: z.enum(['VISA', 'MASTERCARD', 'AMEX', 'SUBSIDIZED']).optional(),
  min_amount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  max_amount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("50")
});
