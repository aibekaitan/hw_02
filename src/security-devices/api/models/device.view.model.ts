// src/security-devices/api/models/device.view.model.ts

// import { DeviceDBWithId } from '../../infrastructure/security-devices.repository';

export interface DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string; // ISO-строка
  deviceId: string;
}
