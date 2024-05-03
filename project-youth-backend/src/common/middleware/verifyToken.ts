declare module 'express-serve-static-core' {
  interface Request {
    user?: jwtPayload;
  }
}
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { env } from '@src/config/env';

export type jwtPayload = {
  email: string;
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
};

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.headers.authorization;

  if (!authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Unauthorized request');
  }
  try {
    const token: string | undefined = authUser.split(' ')[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Invalid token');
    }
    const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret);
    req.user = decoded as jwtPayload;

    next();
  } catch (error: any) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Invalid token');
  }
};

export default verifyToken;
