import { z } from 'zod';

const customerIdSchema = z.string().min(1);

export const paymentIntentRequestSchema = z.object({
  amount: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  customer_id: customerIdSchema.optional(),
});

export const setupIntentRequestSchema = z.object({
  customer_id: customerIdSchema.optional(),
});

export type PaymentIntentRequest = z.infer<typeof paymentIntentRequestSchema>;
export type SetupIntentRequest = z.infer<typeof setupIntentRequestSchema>;
