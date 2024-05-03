import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CouponPayload = z.object({
  userId: z.string(),
  code: z.string(),
});

export const GetCouponResponse = z.object({
  _id: z.string(),
  code: z.string(),
  bonusPoint: z.number(),
  remainCount: z.number(),
  expired: z.string(),
});

export const UsedCouponResponse = z.object({
  _id: z.string(),
  code: z.string(),
  usedBy: z.string(),
  bonusPoint: z.number(),
  expired: z.date(),
  usedAt: z.date(),
});

export const UsedCouponPayload = z.object({
  code: z.string(),
  usedBy: z.string(),
  bonusPoint: z.number(),
  expired: z.date(),
  usedAt: z.date(),
});

export type TypeCouponPayload = z.infer<typeof CouponPayload>;
export type TypeGetCouponResponse = z.infer<typeof GetCouponResponse>;
export type TypeUsedCouponResponse = z.infer<typeof UsedCouponResponse>;
export type TypeUsedCouponPayload = z.infer<typeof UsedCouponPayload>;
