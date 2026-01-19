import { Response, Request, Router } from 'express';
import {
  RequestWithBody,
  RequestWithUserId,
} from '../../common/types/requests';
import { LoginInputModel } from '../types/login.dto';
import { passwordValidation } from '../../users/api/middlewares/password.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { loginOrEmailValidation } from '../../users/api/middlewares/login.or.email.valid';
import { accessTokenGuard } from './guards/access.token.guard';
import { IdType } from '../../common/types/id';
import { loginValidation } from '../../users/api/middlewares/login.validation';
import { emailValidation } from '../../users/api/middlewares/email.validation';
import { CreateUserDto } from '../../users/types/create-user.dto';
import { requestLoggerAndLimiter } from '../middlewares/rate-limit.middleware';
import { refreshTokenGuard } from './guards/refresh.token.guard';
import { existingEmailValidation } from '../../users/api/middlewares/existing.email.validation';
import { newPasswordValidation } from '../../users/api/middlewares/new.password.validation';
import { loginUserMiddleware } from '../middlewares/login.user.middleware';
import { refreshTokenMiddleware } from '../middlewares/refresh.token.middleware';
import { logoutMiddleware } from '../middlewares/logout.middleware';
import { registrationMiddleware } from '../middlewares/registration.middleware';
import { passwordRecoveryMiddleware } from '../middlewares/password.recovery.middleware';
import { registrationConfimationMiddleware } from '../middlewares/registration.confirmation.middleware';
import { newPasswordMiddleware } from '../middlewares/new.password.middleware';
import { emailResendingMiddleware } from '../middlewares/email.resending.middleware';
import { meMiddleware } from '../middlewares/me.middleware';

export const authRouter = Router();

authRouter.post(
  '/login',
  requestLoggerAndLimiter,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  loginUserMiddleware,
  async (req: RequestWithBody<LoginInputModel>, res: Response) => {},
);

authRouter.post(
  '/refresh-token',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  refreshTokenMiddleware,
  async (req: Request, res: Response) => {},
);

authRouter.post(
  '/logout',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  logoutMiddleware,
  async (req: Request, res: Response) => {},
);

authRouter.post(
  '/registration',
  requestLoggerAndLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  registrationMiddleware,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {},
);

authRouter.post(
  '/password-recovery',
  requestLoggerAndLimiter,
  existingEmailValidation,
  inputValidation,
  passwordRecoveryMiddleware,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {},
);

authRouter.post(
  '/registration-confirmation',
  requestLoggerAndLimiter,
  inputValidation,
  registrationConfimationMiddleware,
  async (req: Request, res: Response) => {},
);

authRouter.post(
  '/new-password',
  requestLoggerAndLimiter,
  newPasswordValidation,
  inputValidation,
  newPasswordMiddleware,
  async (req: Request, res: Response) => {},
);

authRouter.post(
  '/registration-email-resending',
  requestLoggerAndLimiter,
  inputValidation,
  emailResendingMiddleware,
  async (req: Request, res: Response) => {},
);

authRouter.get(
  '/me',
  accessTokenGuard,
  meMiddleware,
  async (req: RequestWithUserId<IdType>, res: Response) => {},
);
