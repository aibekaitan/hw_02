import { Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import {
  RequestWithParams,
  RequestWithUserId,
} from '../../common/types/requests';
import { IdType } from '../../common/types/id';
import { SecurityDevicesService } from '../domain/security-devices.service';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { ResultStatus } from '../../common/result/resultCode';

export class SecurityDevicesController {
  constructor(protected securityDevicesService: SecurityDevicesService) {}
  async getDevice(req: RequestWithUserId<IdType>, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const devices =
      await this.securityDevicesService.getAllDevicesForUser(userId);

    res.status(HttpStatuses.Success).json(devices);
  }
  async deleteDevice(req: RequestWithUserId<IdType>, res: Response) {
    const userId = req.user?.id;
    const currentDeviceId = req.context?.deviceId;

    if (!userId || !currentDeviceId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await this.securityDevicesService.terminateAllExceptCurrent(
      userId,
      currentDeviceId,
    );

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json(result.extensions);
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async deleteDeviceById(
    req: RequestWithParams<{ deviceId: string }> & RequestWithUserId<IdType>,
    res: Response,
  ) {
    const userId = req.user?.id;
    const deviceIdToDelete = req.params.deviceId;

    if (!userId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await this.securityDevicesService.terminateDevice(
      userId,
      deviceIdToDelete,
    );

    if (result.status !== ResultStatus.Success) {
      const httpStatus = resultCodeToHttpException(result.status);
      return res.status(httpStatus).json(result.extensions ?? []);
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
}
