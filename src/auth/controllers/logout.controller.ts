import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { jwtService } from '../adapters/jwt.service';
import { securityDevicesRepository } from '../../security-devices/infrastructure/security-devices.repository';

export const logoutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(HttpStatuses.Unauthorized);
  }

  const payload = await jwtService.verifyRefreshToken(refreshToken);
  if (!payload || !payload.deviceId) {
    return res.sendStatus(HttpStatuses.Unauthorized);
  }

  await securityDevicesRepository.deleteByDeviceId(payload.deviceId);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.sendStatus(HttpStatuses.NoContent);
};
