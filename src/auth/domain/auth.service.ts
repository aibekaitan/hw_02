import { ResultStatus } from '../../common/result/resultCode';
import { Result } from '../../common/result/result.type';
import { JwtService, jwtService } from '../adapters/jwt.service';
import { UserRepository } from '../../users/infrastructure/user.repository';
import { BcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../users/types/user.db.interface';
import { NodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { User } from '../../users/domain/user.entity';
import { randomUUID } from 'crypto';
import { DevicesRepository } from '../../security-devices/infrastructure/security-devices.repository';
import { WithId } from 'mongodb';
import { UserQueryRepo } from '../../users/infrastructure/user.query.repo';

export class AuthService {
  constructor(
    protected securityDevicesRepository: DevicesRepository,
    protected jwtService: JwtService,
    protected usersRepository: UserRepository,
    protected nodemailerService: NodemailerService,
    protected bcryptService: BcryptService,
    protected usersQwRepository: UserQueryRepo,
  ) {}

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

      console.log('Creating tokens for user:', userId, 'device:', deviceId);
      const accessToken = await this.jwtService.createToken(userId, deviceId);
      const refreshToken = await this.jwtService.createRefreshToken(
        userId,
        deviceId,
      );

      await this.securityDevicesRepository.upsertDevice({
        userId,
        deviceId,
        ip,
        title,
        lastActiveDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        refreshToken: refreshToken,
      });

      return {
        status: ResultStatus.Success,
        data: { accessToken, refreshToken },
        extensions: [],
      };
    } catch (error) {
      console.error('Error in loginUser:', error);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { status: ResultStatus.Unauthorized };
    }

    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload?.deviceId) {
      return { status: ResultStatus.Unauthorized };
    }

    await this.securityDevicesRepository.deleteByDeviceId(payload.deviceId);

    return { status: ResultStatus.Success };
  }

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<IUserDB> | null>> {
    try {
      console.log('checkUserCredentials:', loginOrEmail);

      const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
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
      const isPassCorrect = await this.bcryptService.checkPassword(
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
  }

  async registerUser(
    login: string,
    pass: string,
    email: string,
  ): Promise<Result<User | null>> {
    const exists = await this.usersRepository.doesExistByLoginOrEmail(
      login,
      email,
    );
    if (exists) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'loginOrEmail', message: 'Already Registered' }],
      };
    }

    const passwordHash = await this.bcryptService.generateHash(pass);
    const newUser = new User(login, email, passwordHash);

    await this.usersRepository.create(newUser);

    await this.nodemailerService
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
  }

  async confirmEmail(code: string): Promise<Result<any>> {
    let user = await this.usersRepository.findUserByConfirmationCode(code);
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
    await this.usersRepository.updateConfirmation(user._id);
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async changePassword(
    recoveryCode: string,
    newPassword: string,
  ): Promise<Result<any>> {
    let user =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Incorrect code' }],
      };
    }
    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(recoveryCode);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Incorrect code' }],
      };
    }
    const passwordHash = await this.bcryptService.generateHash(newPassword);

    await this.usersRepository.updatePassword(user._id, passwordHash);
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.deviceId) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Invalid refresh token',
        data: null,
      };
    }

    const device = await this.securityDevicesRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!device || device.userId !== payload.userId) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Device session not found',
        data: null,
      };
    }

    const newAccessToken = await this.jwtService.createToken(
      payload.userId,
      payload.deviceId,
    );
    const newRefreshToken = await this.jwtService.createRefreshToken(
      payload.userId,
      payload.deviceId,
    );
    await this.securityDevicesRepository.upsertDevice({
      userId: payload.userId,
      deviceId: payload.deviceId,
      ip: device.ip,
      title: device.title,
      lastActiveDate: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      refreshToken: newRefreshToken,
    });

    return {
      status: ResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  }

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) {
      return { success: true };
    }

    user.passwordRecoveryCode = randomUUID();
    await this.usersRepository.updatePasswordRecoveryCode(
      user._id,
      user.passwordRecoveryCode,
    );

    await this.nodemailerService.sendEmail(
      user.email,
      user.passwordRecoveryCode,
      emailExamples.passwordRecoveryEmail,
    );

    return { success: true };
  }

  async resendRegistrationEmail(email: string) {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) return { success: false, error: 'User not found' };
    if (user.emailConfirmation.isConfirmed)
      return { success: false, error: 'Email already confirmed' };

    user.emailConfirmation.confirmationCode = randomUUID();
    await this.usersRepository.updateConfirmationCode(
      user._id,
      user.emailConfirmation.confirmationCode,
    );
    await this.nodemailerService.sendEmail(
      user.email,
      user.emailConfirmation.confirmationCode,
      emailExamples.registrationEmail,
    );

    return { success: true };
  }

  async getMe(userId: string) {
    if (!userId) {
      return { status: ResultStatus.Unauthorized };
    }

    const user = await this.usersQwRepository.findById2(userId);
    return { status: ResultStatus.Success, user };
  }
}

// export const authService = {
//   async loginUser(
//     loginOrEmail: string,
//     password: string,
//     ip: string,
//     title: string,
//   ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
//     try {
//       console.log('loginUser called with:', { loginOrEmail });
//
//       const result = await this.checkUserCredentials(loginOrEmail, password);
//       console.log('checkUserCredentials result:', result.status);
//
//       if (result.status !== ResultStatus.Success) {
//         console.log('Returning Unauthorized');
//         return {
//           status: ResultStatus.Unauthorized,
//           errorMessage: 'Unauthorized',
//           extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
//           data: null,
//         };
//       }
//
//       const user = result.data!;
//       const userId = user._id.toString();
//
//       const deviceId = randomUUID();
//
//       console.log('Creating tokens for user:', userId, 'device:', deviceId);
//       const accessToken = await jwtService.createToken(userId, deviceId);
//       const refreshToken = await jwtService.createRefreshToken(
//         userId,
//         deviceId,
//       );
//
//       await securityDevicesRepository.upsertDevice({
//         userId,
//         deviceId,
//         ip,
//         title,
//         lastActiveDate: new Date(),
//         expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         refreshToken: refreshToken,
//       });
//
//       return {
//         status: ResultStatus.Success,
//         data: { accessToken, refreshToken },
//         extensions: [],
//       };
//     } catch (error) {
//       console.error('Error in loginUser:', error);
//       throw error;
//     }
//   },
//
//   async checkUserCredentials(
//     loginOrEmail: string,
//     password: string,
//   ): Promise<Result<WithId<IUserDB> | null>> {
//     try {
//       console.log('checkUserCredentials:', loginOrEmail);
//
//       const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
//       console.log('User found:', user ? 'yes' : 'no');
//
//       if (!user) {
//         return {
//           status: ResultStatus.NotFound,
//           data: null,
//           errorMessage: 'Not Found',
//           extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
//         };
//       }
//
//       console.log('Checking password...');
//       const isPassCorrect = await bcryptService.checkPassword(
//         password,
//         user.passwordHash,
//       );
//
//       if (!isPassCorrect) {
//         return {
//           status: ResultStatus.BadRequest,
//           data: null,
//           errorMessage: 'Bad Request',
//           extensions: [{ field: 'password', message: 'Wrong password' }],
//         };
//       }
//
//       return {
//         status: ResultStatus.Success,
//         data: user,
//         extensions: [],
//       };
//     } catch (error) {
//       console.error('Error in checkUserCredentials:', error);
//       throw error;
//     }
//   },
//
//   async registerUser(
//     login: string,
//     pass: string,
//     email: string,
//   ): Promise<Result<User | null>> {
//     const exists = await usersRepository.doesExistByLoginOrEmail(login, email);
//     if (exists) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'loginOrEmail', message: 'Already Registered' }],
//       };
//     }
//
//     const passwordHash = await bcryptService.generateHash(pass);
//     const newUser = new User(login, email, passwordHash);
//
//     await usersRepository.create(newUser);
//
//     await nodemailerService
//       .sendEmail(
//         newUser.email,
//         newUser.emailConfirmation.confirmationCode,
//         emailExamples.registrationEmail,
//       )
//       .catch((er) => console.error('error in send email:', er));
//
//     return {
//       status: ResultStatus.Success,
//       data: newUser,
//       extensions: [],
//     };
//   },
//
//   async confirmEmail(code: string): Promise<Result<any>> {
//     let user = await usersRepository.findUserByConfirmationCode(code);
//     if (!user) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'code', message: 'Incorrect code' }],
//       };
//     }
//     if (user.emailConfirmation.isConfirmed) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'code', message: 'code is already confirmed' }],
//       };
//     }
//     const isUuid = new RegExp(
//       /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
//     ).test(code);
//
//     if (!isUuid) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'code', message: 'Incorrect code' }],
//       };
//     }
//     await usersRepository.updateConfirmation(user._id);
//     return {
//       status: ResultStatus.Success,
//       data: null,
//       extensions: [],
//     };
//   },
//   async changePassword(
//     recoveryCode: string,
//     newPassword: string,
//   ): Promise<Result<any>> {
//     let user =
//       await usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
//     if (!user) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'recoveryCode', message: 'Incorrect code' }],
//       };
//     }
//     const isUuid = new RegExp(
//       /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
//     ).test(recoveryCode);
//
//     if (!isUuid) {
//       return {
//         status: ResultStatus.BadRequest,
//         errorMessage: 'Bad Request',
//         data: null,
//         extensions: [{ field: 'recoveryCode', message: 'Incorrect code' }],
//       };
//     }
//     const passwordHash = await bcryptService.generateHash(newPassword);
//
//     await usersRepository.updatePassword(user._id, passwordHash);
//     return {
//       status: ResultStatus.Success,
//       data: null,
//       extensions: [],
//     };
//   },
//
//   async refreshTokens(
//     refreshToken: string,
//   ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
//     const payload = await jwtService.verifyRefreshToken(refreshToken);
//     if (!payload || !payload.deviceId) {
//       return {
//         status: ResultStatus.Unauthorized,
//         errorMessage: 'Invalid refresh token',
//         data: null,
//       };
//     }
//
//     const device = await securityDevicesRepository.findByDeviceId(
//       payload.deviceId,
//     );
//     if (!device || device.userId !== payload.userId) {
//       return {
//         status: ResultStatus.Unauthorized,
//         errorMessage: 'Device session not found',
//         data: null,
//       };
//     }
//
//     const newAccessToken = await jwtService.createToken(
//       payload.userId,
//       payload.deviceId,
//     );
//     const newRefreshToken = await jwtService.createRefreshToken(
//       payload.userId,
//       payload.deviceId,
//     );
//     await securityDevicesRepository.upsertDevice({
//       userId: payload.userId,
//       deviceId: payload.deviceId,
//       ip: device.ip,
//       title: device.title,
//       lastActiveDate: new Date(),
//       expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       refreshToken: newRefreshToken,
//     });
//
//     return {
//       status: ResultStatus.Success,
//       data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
//     };
//   },
// };
