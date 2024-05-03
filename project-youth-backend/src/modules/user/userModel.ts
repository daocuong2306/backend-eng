import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  // unique
  id: z.string(),
  username: z.string(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).trim(),
  createdAt: z.date(),
  updatedAt: z.date(),
  photoUrl: z.string().url().optional(),
  remainPoint: z.number().optional(),
  dob: z.date().optional(),
  gender: z.string().optional(),
  role: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  hobbies: z.string().optional(),
  isVerify: z.boolean().optional(),
});

// get detail user
export const GetUserSchema = z.object({
  id: z.string(),
});
