import { Router, Request, Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';
import {
  RequestWithParams,
  RequestWithUserId,
} from '../../common/types/requests';
import { IdType } from '../../common/types/id';
import { securityDevicesService } from '../domain/security-devices.service'; // создай такой сервис
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { ResultStatus } from '../../common/result/resultCode';
import { DeviceViewModel } from './models/device.view.model';

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  '/',
  // accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const devices = await securityDevicesService.getAllDevicesForUser(userId);

    res.status(HttpStatuses.Success).json(devices);
  },
);

securityDevicesRouter.delete(
  '/',
  // accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id;
    const currentDeviceId = req.context?.deviceId;

    if (!userId || !currentDeviceId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await securityDevicesService.terminateAllExceptCurrent(
      userId,
      currentDeviceId,
    );

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json(result.extensions);
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

securityDevicesRouter.delete(
  '/:deviceId',
  // accessTokenGuard,
  async (
    req: RequestWithParams<{ deviceId: string }> & RequestWithUserId<IdType>,
    res: Response,
  ) => {
    const userId = req.user?.id;
    const deviceIdToDelete = req.params.deviceId;

    if (!userId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await securityDevicesService.terminateDevice(
      userId,
      deviceIdToDelete,
    );

    if (result.status !== ResultStatus.Success) {
      const httpStatus = resultCodeToHttpException(result.status);
      return res.status(httpStatus).json(result.extensions ?? []);
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);
