import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['CREATOR', 'DONOR']).default('DONOR'),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;
