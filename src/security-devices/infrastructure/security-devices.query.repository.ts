// src/security-devices/infrastructure/security-devices.query.repository.ts
import { securityDevicesCollection } from '../../db/collections';
import { DeviceViewModel } from '../api/models/device.view.model';
import { DeviceDBWithId } from '../types/devices.dto';

const mapToViewModel = (device: DeviceDBWithId): DeviceViewModel => ({
  ip: device.ip,
  title: device.title,
  lastActiveDate: device.lastActiveDate.toISOString(),
  deviceId: device.deviceId,
});

export const securityDevicesQueryRepository = {
  async findAllByUserId(userId: string): Promise<DeviceViewModel[]> {
    const devices = await securityDevicesCollection
      .find({ userId })
      .sort({ lastActiveDate: -1 })
      .toArray();

    return devices.map(mapToViewModel);
  },
  async findByDeviceId(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await securityDevicesCollection.findOne({ deviceId });
    if (!device) return null;
    return mapToViewModel(device);
  },
  async existsByDeviceId(deviceId: string): Promise<boolean> {
    const count = await securityDevicesCollection.countDocuments(
      { deviceId },
      { limit: 1 },
    );
    return count > 0;
  },
};
