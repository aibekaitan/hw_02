import { ResultStatus } from '../../common/result/resultCode';
import { Result } from '../../common/result/result.type';
import { jwtService } from '../adapters/jwt.service';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../users/types/user.db.interface';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { User } from '../../users/domain/user.entity';
import { randomUUID } from 'crypto';
import { securityDevicesRepository } from '../../security-devices/infrastructure/security-devices.repository';
import { WithId } from 'mongodb';

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
    ip: string,
    title: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    try {
      console.log('loginUser called with:', { loginOrEmail });

      const result = await this.checkUserCredentials(loginOrEmail, password);
      console.log('checkUserCredentials result:', result.status);

      if (result.status !== ResultStatus.Success) {
        console.log('Returning Unauthorized');
        return {
          status: ResultStatus.Unauthorized,
          errorMessage: 'Unauthorized',
          extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
          data: null,
        };
      }

      const user = result.data!;
      const userId = user._id.toString();

      const deviceId = randomUUID();

      await securityDevicesRepository.upsertDevice({
        userId,
        deviceId,
        ip,
        title,
        lastActiveDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log('Creating tokens for user:', userId, 'device:', deviceId);
      const accessToken = await jwtService.createToken(userId, deviceId);
      const refreshToken = await jwtService.createRefreshToken(
        userId,
        deviceId,
      );

      return {
        status: ResultStatus.Success,
        data: { accessToken, refreshToken },
        extensions: [],
      };
    } catch (error) {
      console.error('Error in loginUser:', error);
      throw error;
    }
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<IUserDB> | null>> {
    try {
      console.log('checkUserCredentials:', loginOrEmail);

      const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
      console.log('User found:', user ? 'yes' : 'no');

      if (!user) {
        return {
          status: ResultStatus.NotFound,
          data: null,
          errorMessage: 'Not Found',
          extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
        };
      }

      console.log('Checking password...');
      const isPassCorrect = await bcryptService.checkPassword(
        password,
        user.passwordHash,
      );

      if (!isPassCorrect) {
        return {
          status: ResultStatus.BadRequest,
          data: null,
          errorMessage: 'Bad Request',
          extensions: [{ field: 'password', message: 'Wrong password' }],
        };
      }

      return {
        status: ResultStatus.Success,
        data: user,
        extensions: [],
      };
    } catch (error) {
      console.error('Error in checkUserCredentials:', error);
      throw error;
    }
  },

  async registerUser(
    login: string,
    pass: string,
    email: string,
  ): Promise<Result<User | null>> {
    const exists = await usersRepository.doesExistByLoginOrEmail(login, email);
    if (exists) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'loginOrEmail', message: 'Already Registered' }],
      };
    }

    const passwordHash = await bcryptService.generateHash(pass);
    const newUser = new User(login, email, passwordHash);

    await usersRepository.create(newUser);

    await nodemailerService
      .sendEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error('error in send email:', er));

    return {
      status: ResultStatus.Success,
      data: newUser,
      extensions: [],
    };
  },

  async confirmEmail(code: string): Promise<Result<any>> {
    let user = await usersRepository.findUserByConfirmationCode(code);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }
    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'code is already confirmed' }],
      };
    }
    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(code);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }
    await usersRepository.updateConfirmation(user._id);
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async refreshTokens(
    refreshToken: string,
    ip: string,
    title: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.deviceId) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Invalid refresh token',
        data: null,
      };
    }

    const device = await securityDevicesRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!device || device.userId !== payload.userId) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Device session not found',
        data: null,
      };
    }

    await securityDevicesRepository.upsertDevice({
      userId: payload.userId,
      deviceId: payload.deviceId,
      ip,
      title,
      lastActiveDate: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const newAccessToken = await jwtService.createToken(
      payload.userId,
      payload.deviceId,
    );
    const newRefreshToken = await jwtService.createRefreshToken(
      payload.userId,
      payload.deviceId,
    );

    return {
      status: ResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  },
};
