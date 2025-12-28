import jwt from 'jsonwebtoken';
import { appConfig } from '../../common/config/config';

export const jwtService = {
  async createToken(userId: string): Promise<string> {
    console.log(appConfig.AC_TIME);
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: Number(appConfig.AC_TIME),
    });
  },
  async createRefreshToken(userId: string): Promise<string> {
    console.log(appConfig.AC_TIME);
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: Number(appConfig.AC_TIME),
    });
  },
  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      console.log(appConfig.AC_TIME);
      return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
    } catch (error: any) {
      console.error('Token verify some error', error.message);
      return null;
    }
  },
};
