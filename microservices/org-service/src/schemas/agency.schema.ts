import { z } from 'zod';

export const AssignCommerceSchema = z.object({
  agency_id: z.string().uuid(),
  commerce_ids: z.array(z.string().uuid()).min(1)
});

export const UnassignCommerceSchema = z.object({
  agency_id: z.string().uuid(),
  commerce_id: z.string().uuid()
});
export type AssignCommerceDTO = z.infer<typeof AssignCommerceSchema>;
export type UnassignCommerceDTO = z.infer<typeof UnassignCommerceSchema>;
