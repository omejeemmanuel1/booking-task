import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { SignupSchema as signupSchema } from '@/lib/schemas/auth';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/admin-signup:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signup'
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
 
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const { email, password, name } = validatedData;

    const type = 'ADMIN';

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
    console.error('Admin signup error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}