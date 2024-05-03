import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// define all type of me: get profile, update profile, history
// profile

export const ProfileResponse = z.object({
  id: z.number(),
  username: z.string().trim(),
  email: z.string().email().trim(),
  createdAt: z.date(),
  updatedAt: z.date(),
  photoUrl: z.string().url().optional(),
  remainPoint: z.number().optional(),
  role: z.string(),
  dob: z.date(),
  gender: z.string(),
});

export type TypeProfileResponse = z.infer<typeof ProfileResponse>;

// history

export const HistoryResponse = z.object({
  id: z.number(), // history id
  userId: z.number(), // user id
  skill: z.string(), // skill name
  createdAt: z.date(), // created date
  updatedAt: z.date(), // updated date
});

export type TypeHistoryResponse = z.infer<typeof HistoryResponse>;

// for api get occupation
export const OccupationResponse = z.object({
  _id: z.string(),
  name: z.string(),
});

export type TypeOccupationResponse = z.infer<typeof OccupationResponse>;

export const VerifyUserResponse = z.object({
  message: z.string(),
});
export type TypeVerifyUserResponse = z.infer<typeof VerifyUserResponse>;

export const VerifyCodeResponse = z.object({
  userId: z.string(),
  verifyCode: z.string(),
  userEmail: z.string(),
  expireAt: z.date(),
});
export type TypeVerifyCodeResponse = z.infer<typeof VerifyCodeResponse>;

export const UpdateProfileRequest = z.object({
  dob: z.string(),
  occupation: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  hobbies: z.string(),
  photoUrl: z.string().url().optional(),
  gender: z.string(),
});

export type TypeUpdateProfileRequest = z.infer<typeof UpdateProfileRequest>;
