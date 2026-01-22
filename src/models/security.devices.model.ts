// models/device.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDevice {
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
  refreshToken: string;
}

const deviceSchema = new Schema<IDevice & Document>(
  {
    userId: { type: String, required: true },
    deviceId: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    lastActiveDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    refreshToken: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);

export const DeviceModel = model<IDevice>('Device', deviceSchema);
