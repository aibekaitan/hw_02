import { Router } from 'express';
import { passwordValidation } from '../../users/api/middlewares/password.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { loginOrEmailValidation } from '../../users/api/middlewares/login.or.email.valid';
import { accessTokenGuard } from './guards/access.token.guard';
import { loginValidation } from '../../users/api/middlewares/login.validation';
import { emailValidation } from '../../users/api/middlewares/email.validation';
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
);

authRouter.post(
  '/refresh-token',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  refreshTokenMiddleware,
);

authRouter.post(
  '/logout',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  logoutMiddleware,
);

authRouter.post(
  '/registration',
  requestLoggerAndLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  registrationMiddleware,
);

authRouter.post(
  '/password-recovery',
  requestLoggerAndLimiter,
  existingEmailValidation,
  inputValidation,
  passwordRecoveryMiddleware,
);

authRouter.post(
  '/registration-confirmation',
  requestLoggerAndLimiter,
  inputValidation,
  registrationConfimationMiddleware,
);

authRouter.post(
  '/new-password',
  requestLoggerAndLimiter,
  newPasswordValidation,
  inputValidation,
  newPasswordMiddleware,
);

authRouter.post(
  '/registration-email-resending',
  requestLoggerAndLimiter,
  inputValidation,
  emailResendingMiddleware,
);

authRouter.get('/me', accessTokenGuard, meMiddleware);
