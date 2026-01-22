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
import { loginUserController } from '../controllers/login.user.controller';
import { refreshTokenController } from '../controllers/refresh.token.controller';
import { logoutController } from '../controllers/logout.controller';
import { registrationController } from '../controllers/registration.controller';
import { passwordRecoveryController } from '../controllers/password.recovery.controller';
import { registrationConfirmationController } from '../controllers/registration.confirmation.controller';
import { newPasswordController } from '../controllers/new.password.controller';
import { emailResendingController } from '../controllers/email.resending.controller';
import { meController } from '../controllers/me.controller';

export const authRouter = Router();

authRouter.post(
  '/login',
  requestLoggerAndLimiter,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  loginUserController,
);

authRouter.post(
  '/refresh-token',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  refreshTokenController,
);

authRouter.post(
  '/logout',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  logoutController,
);

authRouter.post(
  '/registration',
  requestLoggerAndLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  registrationController,
);

authRouter.post(
  '/password-recovery',
  requestLoggerAndLimiter,
  existingEmailValidation,
  inputValidation,
  passwordRecoveryController,
);

authRouter.post(
  '/registration-confirmation',
  requestLoggerAndLimiter,
  inputValidation,
  registrationConfirmationController,
);

authRouter.post(
  '/new-password',
  requestLoggerAndLimiter,
  newPasswordValidation,
  inputValidation,
  newPasswordController,
);

authRouter.post(
  '/registration-email-resending',
  requestLoggerAndLimiter,
  inputValidation,
  emailResendingController,
);

authRouter.get('/me', accessTokenGuard, meController);
