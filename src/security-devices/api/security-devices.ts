import { Router } from 'express';
import { refreshTokenGuard } from '../../auth/api/guards/refresh.token.guard';
import { SecurityDevicesController } from './devices.controller';
import { container } from '../../composition-root';
const securityDevicesControllerInstance = container.get(
  SecurityDevicesController,
);
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
