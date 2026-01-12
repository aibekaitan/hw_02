import { WithId } from 'mongodb';

export interface DeviceDB {
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
  // createdAt?: Date;
}
export type DeviceDBWithId = WithId<DeviceDB>;
