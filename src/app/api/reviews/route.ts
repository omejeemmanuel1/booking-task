import { NextRequest, NextResponse } from 'next/server';
import { createReview, getReviewsByBookingId } from '@/prisma/services/review';
import { verifyToken } from '@/lib/auth';
import { ReviewSchema } from '@/lib/schemas/Review';

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get reviews by booking ID
 *     description: Retrieve a list of reviews for a specific booking ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the booking to retrieve reviews for.
 *     responses:
 *       200:
 *         description: A list of reviews.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Bad request, e.g., missing bookingId.
 *       401:
 *         description: Unauthorized, no valid token.
 *       500:
 *         description: Internal server error.
 *   post:
 *     summary: Create a new review
 *     description: Create a new review for a booking.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const reviews = await getReviewsByBookingId(bookingId);
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     description: Allows a client to create a new review for a completed booking.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized - User not authenticated or not a client.
 *       403:
 *         description: Forbidden - Unauthorized to review this booking.
 *       404:
 *         description: Booking not found.
 *       409:
 *         description: Booking already reviewed.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = ReviewSchema.parse(body);

    const newReview = await createReview(validatedData);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}