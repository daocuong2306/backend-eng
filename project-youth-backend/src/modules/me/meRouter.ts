import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import {
  OccupationResponse,
  ProfileResponse,
  TypeUpdateProfileRequest,
  UpdateProfileRequest,
} from '@modules/me/meModel';
import { meService } from '@modules/me/meService';
import { UserSchema } from '@modules/user/userModel';

export const meRegistry = new OpenAPIRegistry();

const bearerAuth = meRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

meRegistry.register('Occupation', OccupationResponse);
export const meRouter: Router = (() => {
  const router = express.Router();

  meRegistry.registerPath({
    method: 'get',
    path: '/v1/me',
    tags: ['Me'],
    responses: createApiResponse(ProfileResponse, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/me', verifyToken, async (_req: Request, res: Response) => {
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    const serviceResponse = await meService.getMyProfile(userId);
    handleServiceResponse(serviceResponse, res);
  });

  meRegistry.registerPath({
    method: 'get',
    path: '/v1/occupation',
    tags: ['Me'],
    responses: createApiResponse(z.array(OccupationResponse), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/occupation', verifyToken, async (_req: Request, res: Response) => {
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    if (!userId) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'You must login to use this feature',
        null,
        StatusCodes.NOT_FOUND,
      );
      handleServiceResponse(serviceResponse, res);
    }
    const serviceResponse = await meService.getOccupation(userId);
    handleServiceResponse(serviceResponse, res);
  });
  // generate verify code for user
  meRegistry.registerPath({
    method: 'get',
    path: '/v1/verify-code',
    tags: ['Me'],
    responses: createApiResponse(z.string(), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/verify-code', verifyToken, async (_req: Request, res: Response) => {
    const { userId, email } = (_req as Request & { user: jwtPayload }).user;
    const serviceResponse = await meService.generateVerifyCode(userId, email);
    handleServiceResponse(serviceResponse, res);
  });

  // verify user
  meRegistry.registerPath({
    method: 'post',
    path: '/v1/verify-user',
    tags: ['Me'],
    responses: createApiResponse(z.string(), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              verifyCode: { type: 'string' },
            },
            required: ['verifyCode'],
          },
        },
      },
    },
  }),
    router.post('/verify-user', verifyToken, async (_req: Request, res: Response) => {
      const { userId } = (_req as Request & { user: jwtPayload }).user;
      const {
        verifyCode,
      }: {
        verifyCode: string;
      } = _req.body;
      const serviceResponse = await meService.handleVerifyUser(userId, verifyCode);
      handleServiceResponse(serviceResponse, res);
    });

  // update profile
  meRegistry.registerPath({
    method: 'put',
    path: '/v1/update-profile',
    tags: ['Me'],
    responses: createApiResponse(UserSchema, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              dob: { type: 'string' },
              occupation: { type: 'string' },
              phoneNumber: { type: 'string' },
              address: { type: 'string' },
              hobbies: { type: 'string' },
              gender: { type: 'string' },
              // optional
              photoUrl: { type: 'string', format: 'uri', nullable: true },
            },
            required: ['username', 'dob', 'occupation', 'phoneNumber', 'address', 'hobbies'],
          },
        },
      },
    },
  });

  router.put('/update-profile', verifyToken, async (_req: Request, res: Response) => {
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    const { dob, occupation, phoneNumber, address, hobbies, gender }: TypeUpdateProfileRequest = _req.body;
    const photoUrl = _req.body?.photoUrl || '';

    const verifyPayload = UpdateProfileRequest.safeParse({
      dob,
      occupation,
      phoneNumber,
      address,
      hobbies,
      photoUrl,
      gender,
    });

    if (!verifyPayload.success) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Invalid input',
        null,
        StatusCodes.BAD_REQUEST,
      );
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const payload = {
      dob,
      occupation,
      phoneNumber,
      address,
      hobbies,
      photoUrl,
      gender,
    };
    const serviceResponse = await meService.updateProfile(userId, payload);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
