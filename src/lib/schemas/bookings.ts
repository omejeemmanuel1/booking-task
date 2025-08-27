import { z } from 'zod';

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  bookingDate: z.string().datetime(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;