import jwt from 'jsonwebtoken';
import { appConfig } from '../../common/config/config';

export interface JwtPayload {
  userId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}

export const jwtService = {
  async createToken(userId: string, deviceId: string): Promise<string> {
    const payload: JwtPayload = { userId, deviceId };
    return jwt.sign(payload, appConfig.AC_SECRET, {
      expiresIn: Number(appConfig.AC_TIME),
    });
  },

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    const payload: JwtPayload = { userId, deviceId };
    return jwt.sign(payload, appConfig.RT_SECRET || appConfig.AC_SECRET, {
      expiresIn: Number(appConfig.RT_TIME),
    });
  },

  async decodeToken(token: string): Promise<JwtPayload | null> {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch (e) {
      console.error("Can't decode token", e);
      return null;
    }
  },

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = jwt.verify(token, appConfig.AC_SECRET) as JwtPayload;

      if (!payload.userId || !payload.deviceId) {
        throw new Error('Invalid token payload');
      }

      return payload;
    } catch (error: any) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  },

  async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = jwt.verify(
        token,
        appConfig.RT_SECRET || appConfig.AC_SECRET,
      ) as JwtPayload;

      if (!payload.userId || !payload.deviceId) {
        throw new Error('Invalid refresh token payload');
      }

      return payload;
    } catch (error: any) {
      console.error('Refresh token verification failed:', error.message);
      return null;
    }
  },
};
