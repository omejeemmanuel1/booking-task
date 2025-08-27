/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { LoginSchema as loginSchema } from '@/lib/schemas/auth';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized: Not an ADMIN user' }, { status: 401 });
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}