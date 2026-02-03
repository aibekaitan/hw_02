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
import { authControllerInstance } from '../../composition-root';

export const authRouter = Router();

authRouter.post(
  '/login',
  requestLoggerAndLimiter,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  authControllerInstance.login.bind(authControllerInstance),
);

authRouter.post(
  '/refresh-token',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  authControllerInstance.refreshToken.bind(authControllerInstance),
);

authRouter.post(
  '/logout',
  requestLoggerAndLimiter,
  refreshTokenGuard,
  authControllerInstance.logout.bind(authControllerInstance),
);

authRouter.post(
  '/registration',
  requestLoggerAndLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  authControllerInstance.registration.bind(authControllerInstance),
);

authRouter.post(
  '/password-recovery',
  requestLoggerAndLimiter,
  existingEmailValidation,
  inputValidation,
  authControllerInstance.passwordRecovery.bind(authControllerInstance),
);

authRouter.post(
  '/registration-confirmation',
  requestLoggerAndLimiter,
  inputValidation,
  authControllerInstance.registrationConfirmation.bind(authControllerInstance),
);

authRouter.post(
  '/new-password',
  requestLoggerAndLimiter,
  newPasswordValidation,
  inputValidation,
  authControllerInstance.newPassword.bind(authControllerInstance),
);

authRouter.post(
  '/registration-email-resending',
  requestLoggerAndLimiter,
  inputValidation,
  authControllerInstance.registrationEmailResending.bind(
    authControllerInstance,
  ),
);

authRouter.get(
  '/me',
  accessTokenGuard,
  authControllerInstance.getMe.bind(authControllerInstance),
);
