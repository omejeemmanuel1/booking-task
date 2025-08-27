import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string().uuid().optional(),
  bookingId: z.string().uuid(),
  clientId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;