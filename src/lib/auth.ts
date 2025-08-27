/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = async (request: NextRequest) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
};