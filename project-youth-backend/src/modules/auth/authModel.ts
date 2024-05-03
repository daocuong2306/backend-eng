import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// define all type of auth: login, register, verify, change password, forgot password, logout
export const RegisterPayload = z.object({
  username: z.string(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).trim(),
  photoUrl: z.string().url().optional(),
});

export const LoginPayload = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).trim(),
});

export const ChangePasswordPayload = z.object({
  oldPassword: z.string().min(6).trim(),
  newPassword: z.string().min(6).trim(),
  email: z.string().email().trim().toLowerCase(),
});

export const ForgotPasswordPayload = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export const LogoutPayload = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export type TypeRegisterPayload = z.infer<typeof RegisterPayload>;
export type TypeLoginPayload = z.infer<typeof LoginPayload>;
export type TypeChangePasswordPayload = z.infer<typeof ChangePasswordPayload>;
export type TypeForgotPasswordPayload = z.infer<typeof ForgotPasswordPayload>;

export const RegisterResponse = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email().trim().toLowerCase(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.string(),
  gender: z.string().optional(),
  dob: z.date().optional(),
  photoUrl: z.string().url().optional(),
  remainPoint: z.number().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  hobbies: z.string().optional(),
  isVerify: z.boolean().optional(),
});

export type TypeRegisterResponse = z.infer<typeof RegisterResponse>;

export const LoginResponse = z.object({
  token: z.string(),
  user: RegisterResponse,
});

export type TypeLoginResponse = z.infer<typeof LoginResponse>;

export const ChangePasswordResponse = z.object({
  message: z.string(),
  password: z.string().min(6).trim(),
});

export type TypeChangePasswordResponse = z.infer<typeof ChangePasswordResponse>;

export const ForgotPasswordResponse = z.object({
  message: z.string(),
});

export type TypeForgotPasswordResponse = z.infer<typeof ForgotPasswordResponse>;

// logout
export const LogoutResponse = z.object({
  message: z.string(),
});

export type TypeLogoutResponse = z.infer<typeof LogoutResponse>;
