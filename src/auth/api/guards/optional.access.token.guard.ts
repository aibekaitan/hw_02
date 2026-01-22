import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { securityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export const optionalAccessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization) {
    return next();
  }

  const parts = req.headers.authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  const payload = await jwtService.verifyToken(token);
  if (!payload) {
    return next();
  }

  const { userId, deviceId } = payload;

  if (!userId || !deviceId) {
    return next();
  }

  const device = await securityDevicesRepository.findByDeviceId(deviceId);
  if (!device || device.userId !== userId) {
    return next();
  }

  req.user = { id: userId };
  req.device = { id: deviceId };

  next();
};
