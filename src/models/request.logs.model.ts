// models/request-log.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IRequestLog {
  ip: string;
  url: string;
  date: Date;
  method?: string;
  userId?: string;
}

const requestLogSchema = new Schema<IRequestLog & Document>(
  {
    ip: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    method: { type: String },
    userId: { type: String },
  },
  {
    versionKey: false,
  },
);

export const RequestLogModel = model<IRequestLog>(
  'RequestLog',
  requestLogSchema,
);
