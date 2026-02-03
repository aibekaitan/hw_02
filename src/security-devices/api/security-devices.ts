import { Router } from 'express';
import { refreshTokenGuard } from '../../auth/api/guards/refresh.token.guard';
import { securityDevicesControllerInstance } from '../../composition-root';

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  '/',
  refreshTokenGuard,
  securityDevicesControllerInstance.getDevice.bind(
    securityDevicesControllerInstance,
  ),
);

securityDevicesRouter.delete(
  '/',
  refreshTokenGuard,
  securityDevicesControllerInstance.deleteDevice.bind(
    securityDevicesControllerInstance,
  ),
);

securityDevicesRouter.delete(
  '/:deviceId',
  refreshTokenGuard,
  securityDevicesControllerInstance.deleteDeviceById.bind(
    securityDevicesControllerInstance,
  ),
);
