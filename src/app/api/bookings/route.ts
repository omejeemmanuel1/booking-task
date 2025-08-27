import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { CreateBookingSchema as createBookingSchema } from '@/lib/schemas/bookings';
import { z } from 'zod';

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Allows a client to create a new booking for a service.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBooking'
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   type: object
 *                   description: The newly created booking object.
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized - User not authenticated or not a client.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user || user.type !== 'CLIENT') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const { serviceId, providerId, bookingDate } = validatedData;

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        serviceId,
        providerId,
        bookingDate: new Date(bookingDate),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error('Create booking error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user's bookings
 *     description: Retrieves a list of bookings associated with the authenticated user (either as client or provider).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       clientId:
 *                         type: string
 *                       serviceId:
 *                         type: string
 *                       providerId:
 *                         type: string
 *                       bookingDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                       client:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       provider:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       service:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           providerId:
 *                             type: string
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: user.id },
          { providerId: user.id },
        ],
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        service: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}