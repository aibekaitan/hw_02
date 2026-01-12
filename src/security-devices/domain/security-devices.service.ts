import { ResultStatus } from '../../common/result/resultCode'; // или откуда у тебя ResultStatus
import { securityDevicesRepository } from '../infrastructure/security-devices.repository';
import { ServiceResult } from '../../common/result/result.type';
import { DeviceViewModel } from '../api/models/device.view.model';
import { securityDevicesQueryRepository } from '../infrastructure/security-devices.query.repository';
export const securityDevicesService = {
  async getAllDevicesForUser(userId: string): Promise<DeviceViewModel[]> {
    return securityDevicesQueryRepository.findAllByUserId(userId);
  },

  async terminateAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<ServiceResult> {
    await securityDevicesRepository.deleteAllExceptCurrent(
      userId,
      currentDeviceId,
    );
    return { status: ResultStatus.Success };
  },

  async terminateDevice(userId: string, deviceId: string) {
    const device = await securityDevicesRepository.findByDeviceId(deviceId);

    if (!device) {
      return {
        status: ResultStatus.NotFound,
        extensions: [{ message: 'Device not found', field: 'deviceId' }],
      };
    }

    if (device.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        extensions: [{ message: 'Forbidden: device belongs to another user' }],
      };
    }

    await securityDevicesRepository.deleteByDeviceId(deviceId);
    return { status: ResultStatus.Success };
  },
};
