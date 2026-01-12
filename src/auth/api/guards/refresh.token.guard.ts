import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { securityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.sendStatus(401);
  }

  const payload = await jwtService.verifyRefreshToken(token);
  if (!payload) {
    return res.sendStatus(401);
  }

  const { userId, deviceId } = payload;

  if (!userId || !deviceId) {
    return res.sendStatus(401);
  }

  const device = await securityDevicesRepository.findByDeviceId(deviceId);
  if (!device || device.userId !== userId) {
    return res.sendStatus(401);
  }

  req.user = { id: userId };
  req.context = { deviceId };

  next();
};
