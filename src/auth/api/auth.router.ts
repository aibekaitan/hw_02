import { Response, Request, Router } from 'express';
import {
  RequestWithBody,
  RequestWithUserId,
} from '../../common/types/requests';
import { LoginInputModel } from '../types/login.dto';
import { authService } from '../domain/auth.service';
import { passwordValidation } from '../../users/api/middlewares/password.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { loginOrEmailValidation } from '../../users/api/middlewares/login.or.email.valid';
import { accessTokenGuard } from './guards/access.token.guard';
import { IdType } from '../../common/types/id';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { usersQwRepository } from '../../users/infrastructure/user.query.repo';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { loginValidation } from '../../users/api/middlewares/login.validation';
import { emailValidation } from '../../users/api/middlewares/email.validation';
import { CreateUserDto } from '../../users/types/create-user.dto';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { jwtService } from '../adapters/jwt.service';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { securityDevicesRepository } from '../../security-devices/infrastructure/security-devices.repository';
import { requestLoggerAndLimiter } from '../middlewares/rate-limit.middleware';
import { refreshTokenGuard } from './guards/refresh.token.guard';

export const authRouter = Router();

authRouter.post(
  '/login',
  requestLoggerAndLimiter,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  async (req: RequestWithBody<LoginInputModel>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const ip = req.ip || 'unknown';
    const title = req.headers['user-agent'] || 'Unknown device';

    const result = await authService.loginUser(
      loginOrEmail,
      password,
      ip,
      title,
    );

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    const { accessToken, refreshToken } = result.data!;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(HttpStatuses.Success).json({ accessToken });
  },
);

authRouter.post(
  '/refresh-token',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await authService.refreshTokens(refreshToken);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data!;

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(HttpStatuses.Success).json({ accessToken });
  },
);

authRouter.post(
  '/logout',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.deviceId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    await securityDevicesRepository.deleteByDeviceId(payload.deviceId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration',
  requestLoggerAndLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {
    const { login, email, password } = req.body;

    const result = await authService.registerUser(login, password, email);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-confirmation',
  requestLoggerAndLimiter,
  inputValidation,
  async (req: Request, res: Response) => {
    const { code } = req.body;

    const result = await authService.confirmEmail(code);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-email-resending',
  requestLoggerAndLimiter,
  inputValidation,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await usersRepository.findByLoginOrEmail(email);
    if (!user) {
      return res.status(HttpStatuses.BadRequest).json({
        errorsMessages: [{ field: 'email', message: 'User not found' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      return res.status(HttpStatuses.BadRequest).json({
        errorsMessages: [
          { field: 'email', message: 'Email already confirmed' },
        ],
      });
    }

    user.emailConfirmation.confirmationCode = randomUUID();
    await usersRepository.updateConfirmationCode(
      user._id,
      user.emailConfirmation.confirmationCode,
    );

    await nodemailerService.sendEmail(
      user.email,
      user.emailConfirmation.confirmationCode,
      emailExamples.registrationEmail,
    );

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.get(
  '/me',
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;
    if (!userId) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }
    const me = await usersQwRepository.findById2(userId);
    res.status(HttpStatuses.Success).send(me);
  },
);
