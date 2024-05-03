import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import { GetCouponResponse } from '@modules/coupon/couponModel';
import { userService } from '@modules/user/userService';

import { GetUserSchema, UserSchema } from './userModel';

export const userRegistry = new OpenAPIRegistry();

const bearerAuth = userRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

userRegistry.register('Admin', UserSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/v1/admin/list-users',
    tags: ['Admin'],
    responses: createApiResponse(z.array(UserSchema), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/list-users', verifyToken, async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'get',
    path: '/v1/admin/detail-user',
    tags: ['Admin'],
    request: {
      query: GetUserSchema,
    },
    responses: createApiResponse(UserSchema, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/detail-user', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.query as { id: string };
    const serviceResponse = await userService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'get',
    path: '/v1/admin/list-coupon',
    tags: ['Admin'],
    responses: createApiResponse(z.array(GetCouponResponse), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });
  router.get('/list-coupon', verifyToken, async (_req: Request, res: Response) => {
    const { userId, role } = (_req as Request & { user: jwtPayload }).user;
    const serviceResponse = await userService.getCoupon(userId, role);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
