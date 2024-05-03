import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import { couponService } from '@modules/coupon/couponService';
import { ProfileResponse } from '@modules/me/meModel';

export const couponRegistry = new OpenAPIRegistry();

const bearerAuth = couponRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const couponRouter: Router = (() => {
  const router = express.Router();

  couponRegistry.registerPath({
    method: 'post',
    path: '/v1/coupon/active-coupon',
    tags: ['Coupon'],
    responses: createApiResponse(ProfileResponse, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              couponCode: {
                type: 'string',
              },
            },
            required: ['couponCode'],
          },
        },
      },
    },
  });

  router.post('/active-coupon', verifyToken, async (_req: Request, res: Response) => {
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    const {
      couponCode,
    }: {
      couponCode: string;
    } = _req.body;
    const serviceResponse = await couponService.activeCoupon(couponCode, userId);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
