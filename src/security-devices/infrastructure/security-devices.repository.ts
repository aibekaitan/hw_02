import { ObjectId, DeleteResult, UpdateResult, WithId } from 'mongodb';
// import { securityDevicesCollection } from '../../db/collections';
import { DeviceDB, DeviceDBWithId } from '../types/devices.dto';
import { DeviceModel } from '../../models/security.devices.model';

export const securityDevicesRepository = {
  async findAllByUserId(userId: string): Promise<DeviceDBWithId[]> {
    return DeviceModel.find({ userId })
      .sort({ lastActiveDate: -1 })
      .select('-__v');
  },
  async findByDeviceId(deviceId: string): Promise<DeviceDBWithId | null> {
    return DeviceModel.findOne({ deviceId }).select('-__v');
  },
  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeviceDBWithId | null> {
    return DeviceModel.findOne({ userId, deviceId }).select('-_id -__v');
  },
  async upsertDevice(
    device: Omit<DeviceDB, '_id'>,
  ): Promise<DeviceDBWithId | null> {
    const result = await DeviceModel.findOneAndUpdate(
      { userId: device.userId, deviceId: device.deviceId },
      {
        $set: {
          ip: device.ip,
          title: device.title,
          lastActiveDate: device.lastActiveDate,
          expirationDate: device.expirationDate,
          refreshToken: device.refreshToken,
          // createdAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        projection: { _id: 0, __v: 0 },
      },
    )
      .select('-__v')
      .lean();

    return result;
  },
  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result: DeleteResult = await DeviceModel.deleteOne({
      deviceId,
    });
    return result.deletedCount === 1;
  },
  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<number> {
    const result: DeleteResult = await DeviceModel.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
    return result.deletedCount;
  },
  async deleteAllByUserId(userId: string): Promise<number> {
    const result: DeleteResult = await DeviceModel.deleteMany({
      userId,
    });
    return result.deletedCount;
  },
  async deleteExpired(): Promise<number> {
    const result: DeleteResult = await DeviceModel.deleteMany({
      expirationDate: { $lt: new Date() },
    });
    return result.deletedCount;
  },
  async updateLastActiveDate(
    deviceId: string,
    newDate: Date = new Date(),
  ): Promise<boolean> {
    const result: UpdateResult = await DeviceModel.updateOne(
      { deviceId },
      { $set: { lastActiveDate: newDate } },
    );
    return result.modifiedCount === 1;
  },
};
