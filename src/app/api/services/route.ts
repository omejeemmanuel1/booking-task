import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     description: Retrieves a list of all available services.
 *     responses:
 *       200:
 *         description: A list of services.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       providerId:
 *                         type: string
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
  try {
    const services = await prisma.service.findMany();
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     description: Allows a provider to create a new service.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the service.
 *               description:
 *                 type: string
 *                 description: Description of the service.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the service.
 *     responses:
 *       201:
 *         description: Service created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: object
 *                   description: The newly created service object.
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized - User not authenticated or not a provider.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user || user.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price } = await request.json();

    if (!name || !price) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        providerId: user.id,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}