import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { LoginSchema as loginSchema } from '@/lib/schemas/auth';
import { z } from 'zod';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successful login, returns user data and JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: User object (excluding password)
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Missing email or password.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id);

    return NextResponse.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}