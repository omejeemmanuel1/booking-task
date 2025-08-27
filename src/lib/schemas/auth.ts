import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  type: z.enum(['CLIENT', 'PROVIDER', 'ADMIN']),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;