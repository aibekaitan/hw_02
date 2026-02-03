import { ResultStatus } from '../../common/result/resultCode'; // или откуда у тебя ResultStatus
import { DevicesRepository } from '../infrastructure/security-devices.repository';
import { ServiceResult } from '../../common/result/result.type';
import { DeviceViewModel } from '../api/models/device.view.model';
import { SecurityDevicesQueryRepository } from '../infrastructure/security-devices.query.repository';

export class SecurityDevicesService {
  constructor(
    protected securityDevicesRepository: DevicesRepository,
    protected securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}
  async getAllDevicesForUser(userId: string): Promise<DeviceViewModel[]> {
    return this.securityDevicesQueryRepository.findAllByUserId(userId);
  }

  async terminateAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<ServiceResult> {
    await this.securityDevicesRepository.deleteAllExceptCurrent(
      userId,
      currentDeviceId,
    );
    return { status: ResultStatus.Success };
  }

  async terminateDevice(userId: string, deviceId: string) {
    const device =
      await this.securityDevicesRepository.findByDeviceId(deviceId);

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

    await this.securityDevicesRepository.deleteByDeviceId(deviceId);
    return { status: ResultStatus.Success };
  }
}
