import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../common/types/id';
import { securityDevicesRepository } from '../../../composition-root';

export const accessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('--- accessTokenGuard START ---');

  console.log('Authorization header received:', req.headers.authorization);
  if (!req.headers.authorization) {
    console.log('❌ No Authorization header');
    return res.sendStatus(401);
  }

  const parts = req.headers.authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('❌ Wrong Authorization format');
    return res.sendStatus(401);
  }

  const token = parts[1];

  const payload = await jwtService.verifyToken(token);
  if (!payload) {
    console.log('❌ Token verification failed');
    return res.sendStatus(401);
  }

  const { userId, deviceId } = payload;

  if (!userId || !deviceId) {
    console.log('❌ Token missing userId or deviceId');
    return res.sendStatus(401);
  }

  req.user = { id: userId };
  req.device = { id: deviceId };

  const deviceExists = await securityDevicesRepository.findByDeviceId(deviceId);
  if (!deviceExists || deviceExists.userId !== userId) {
    console.log('❌ Device not found or belongs to another user');
    return res.sendStatus(401);
  }

  console.log(`✅ Passed for user: ${userId}, device: ${deviceId}`);
  next();
};
