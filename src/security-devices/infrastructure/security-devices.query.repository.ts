// src/security-devices/infrastructure/security-devices.query.repository.ts
// import { securityDevicesCollection } from '../../db/collections';
import { DeviceViewModel } from '../api/models/device.view.model';
import { DeviceDBWithId } from '../types/devices.dto';
import { DeviceModel } from '../../models/security.devices.model';
import { injectable } from 'inversify';

const mapToViewModel = (device: DeviceDBWithId): DeviceViewModel => ({
  ip: device.ip,
  title: device.title,
  lastActiveDate: device.lastActiveDate.toISOString(),
  deviceId: device.deviceId,
});
@injectable()
export class SecurityDevicesQueryRepository {
  constructor() {}
  async findAllByUserId(userId: string): Promise<DeviceViewModel[]> {
    const devices = await DeviceModel.find({ userId })
      .sort({ lastActiveDate: -1 })
      .select('-__v')
      .lean();

    return devices.map(mapToViewModel);
  }
  async findByDeviceId(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await DeviceModel.findOne({ deviceId }).lean();
    if (!device) return null;
    return mapToViewModel(device);
  }
  async existsByDeviceId(deviceId: string): Promise<boolean> {
    const count = await DeviceModel.countDocuments({ deviceId }, { limit: 1 });
    return count > 0;
  }
}
