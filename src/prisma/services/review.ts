import prisma from '@/lib/prisma';
import { Review } from '@/lib/schemas/Review';

export async function createReview(data: Review) {
  return prisma.review.create({ data });
}

export async function getReviewsByBookingId(bookingId: string) {
  return prisma.review.findMany({ where: { bookingId } });
}