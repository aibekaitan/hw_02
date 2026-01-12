import { ObjectId, DeleteResult, UpdateResult, WithId } from 'mongodb';
import { securityDevicesCollection } from '../../db/collections';
import { DeviceDB, DeviceDBWithId } from '../types/devices.dto';

export const securityDevicesRepository = {
  async findAllByUserId(userId: string): Promise<DeviceDBWithId[]> {
    return securityDevicesCollection
      .find({ userId })
      .sort({ lastActiveDate: -1 })
      .toArray();
  },
  async findByDeviceId(deviceId: string): Promise<DeviceDBWithId | null> {
    return securityDevicesCollection.findOne({ deviceId });
  },
  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeviceDBWithId | null> {
    return securityDevicesCollection.findOne({ userId, deviceId });
  },
  async upsertDevice(
    device: Omit<DeviceDB, '_id'>,
  ): Promise<DeviceDBWithId | null> {
    const result = await securityDevicesCollection.findOneAndUpdate(
      { userId: device.userId, deviceId: device.deviceId },
      {
        $set: {
          ip: device.ip,
          title: device.title,
          lastActiveDate: device.lastActiveDate,
          expirationDate: device.expirationDate,
          // createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    return result;
  },
  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result: DeleteResult = await securityDevicesCollection.deleteOne({
      deviceId,
    });
    return result.deletedCount === 1;
  },
  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<number> {
    const result: DeleteResult = await securityDevicesCollection.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
    return result.deletedCount;
  },
  async deleteAllByUserId(userId: string): Promise<number> {
    const result: DeleteResult = await securityDevicesCollection.deleteMany({
      userId,
    });
    return result.deletedCount;
  },
  async deleteExpired(): Promise<number> {
    const result: DeleteResult = await securityDevicesCollection.deleteMany({
      expirationDate: { $lt: new Date() },
    });
    return result.deletedCount;
  },
  async updateLastActiveDate(
    deviceId: string,
    newDate: Date = new Date(),
  ): Promise<boolean> {
    const result: UpdateResult = await securityDevicesCollection.updateOne(
      { deviceId },
      { $set: { lastActiveDate: newDate } },
    );
    return result.modifiedCount === 1;
  },
};
