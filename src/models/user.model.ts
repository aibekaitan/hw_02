// models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IUser {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  refreshToken: string;
  passwordRecoveryCode: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
}

const userSchema = new Schema<IUser & Document>(
  {
    login: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    refreshToken: { type: String, default: '' },
    passwordRecoveryCode: { type: String, default: () => randomUUID() },
    emailConfirmation: {
      confirmationCode: { type: String, default: randomUUID },
      expirationDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, // +24 часа, например
      isConfirmed: { type: Boolean, default: false },
    },
  },
  {
    versionKey: false,
  },
);

export const UserModel = model<IUser>('User', userSchema);
