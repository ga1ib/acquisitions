import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  email: z.string().email().max(255).toLowerCase().trim().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
