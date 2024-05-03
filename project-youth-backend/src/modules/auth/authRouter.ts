import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
} from '@modules/auth/authModel';
import { authService } from '@modules/auth/authService';
import { UserSchema } from '@modules/user/userModel';

export const authRegistry = new OpenAPIRegistry();
const bearerAuth = authRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const authRouter: Router = (() => {
  const router = express.Router();

  authRegistry.registerPath({
    method: 'post',
    path: '/v1/auth/register',
    tags: ['Authentication'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
              username: { type: 'string' },
            },
            required: ['email', 'password', 'username'],
          },
        },
      },
    },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  router.post('/register', async (_req: Request, res: Response) => {
    const { email, password, username } = _req.body;
    // validate request
    const payload = RegisterPayload.safeParse({ email, password, username });
    if (!payload.success) {
      const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      handleServiceResponse(serviceResponse, res);
      return;
    }
    // call service
    const serviceResponse = await authService.register(email, password, username);
    handleServiceResponse(serviceResponse, res);
  });

  // login
  authRegistry.registerPath({
    method: 'post',
    path: '/v1/auth/login',
    tags: ['Authentication'],
    // can use requestBody instead of request
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
    },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  router.post('/login', async (_req: Request, res: Response) => {
    const { email, password } = _req.body;
    const payload = LoginPayload.safeParse({ email, password });
    if (!payload.success) {
      const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const serviceResponse = await authService.login(email, password);
    handleServiceResponse(serviceResponse, res);
  });

  // forgot password
  authRegistry.registerPath({
    method: 'post',
    path: '/v1/auth/forgot-password',
    tags: ['Authentication'],
    responses: createApiResponse(ForgotPasswordResponse, 'Success'),
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
            },
            required: ['email'],
          },
        },
      },
    },
  });

  router.post('/forgot-password', async (_req: Request, res: Response) => {
    const { email } = _req.body;
    const payload = ForgotPasswordPayload.safeParse({ email });
    if (!payload.success) {
      const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const serviceResponse = await authService.forgotPassword(email);
    handleServiceResponse(serviceResponse, res);
  });

  // change password
  authRegistry.registerPath({
    method: 'post',
    path: '/v1/auth/change-password',
    tags: ['Authentication'],
    responses: createApiResponse(ChangePasswordResponse, 'Success'),
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              oldPassword: { type: 'string' },
              newPassword: { type: 'string' },
            },
            required: ['email', 'oldPassword', 'newPassword'],
          },
        },
      },
    },
  });

  router.post('/change-password', async (_req: Request, res: Response) => {
    const { email, oldPassword, newPassword } = _req.body;
    const payload = ChangePasswordPayload.safeParse({
      email,
      oldPassword,
      newPassword,
    });
    if (!payload.success) {
      const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      handleServiceResponse(serviceResponse, res);
      return;
    }
    const serviceResponse = await authService.changePassword(email, oldPassword, newPassword);
    handleServiceResponse(serviceResponse, res);
  });

  // logout
  authRegistry.registerPath({
    method: 'post',
    path: '/v1/auth/logout',
    tags: ['Authentication'],
    responses: createApiResponse(z.string(), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.post('/logout', verifyToken, async (_req: Request, res: Response) => {
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    const serviceResponse = await authService.logout(userId);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
