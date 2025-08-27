import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { SignupSchema as signupSchema } from '@/lib/schemas/auth';
import { z } from 'zod';

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Registers a new user with email, password, name, and type.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signup'
 *     responses:
 *       201:
 *         description: User successfully registered, returns user data and JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Newly created user object (excluding password)
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Missing required fields or invalid user type.
 *       409:
 *         description: User with this email already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const { email, password, name, type } = validatedData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type,
      },
    });

    const token = generateToken(user.id);

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}