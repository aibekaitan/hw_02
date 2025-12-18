import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../common/types/id';

export const accessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('--- accessTokenGuard START ---');

  console.log('Authorization header:', req.headers.authorization);

  if (!req.headers.authorization) {
    console.log('❌ No Authorization header');
    res.sendStatus(401);
    return;
  }

  const parts = req.headers.authorization.split(' ');
  console.log('Authorization parts:', parts);

  if (parts.length !== 2) {
    console.log('❌ Authorization header has wrong format');
    res.sendStatus(401);
    return;
  }

  const [authType, token] = parts;

  console.log('Auth type:', authType);
  console.log('Token:', token);

  if (authType !== 'Bearer') {
    console.log('❌ Auth type is not Bearer');
    res.sendStatus(401);
    return;
  }

  const payload = await jwtService.verifyToken(token);
  console.log('JWT payload:', payload);

  if (!payload) {
    console.log('❌ Token verification failed');
    res.sendStatus(401);
    return;
  }

  const { userId } = payload;
  console.log('UserId from token:', userId);

  req.user = { id: userId } as IdType;

  console.log('✅ accessTokenGuard PASSED');
  console.log('--- accessTokenGuard END ---');

  next();
};
