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
// import { HttpStatus } from '../../core/types/http-statuses';
import { accessTokenGuard } from './guards/access.token.guard';
import { IdType } from '../../common/types/id';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { usersQwRepository } from '../../users/infrastructure/user.query.repo';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { loginValidation } from '../../users/api/middlewares/login.validation';
import { emailValidation } from '../../users/api/middlewares/email.validation';
import { CreateUserDto } from '../../users/types/create-user.dto';
import { routersPaths } from '../../common/path/paths';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { randomUUID } from 'crypto';
import { jwtService } from '../adapters/jwt.service';
import cookieParser from 'cookie-parser';

export const authRouter = Router();

authRouter.post(
  '/login',
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  async (req: RequestWithBody<LoginInputModel>, res: Response) => {
    const { loginOrEmail, password } = req.body;
    const result = await authService.loginUser(loginOrEmail, password);
    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
      return;
    }
    res.cookie('jwt', result.data!.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  },
);
authRouter.get(
  '/me',
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }
    const me = await usersQwRepository.findById(userId);

    res.status(HttpStatuses.Success).send(me);
  },
);
authRouter.post(
  '/registration',
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {
    const { login, email, password } = req.body;

    const result = await authService.registerUser(login, password, email);
    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-confirmation',
  inputValidation,
  async (req: Request, res: Response) => {
    const { code } = req.body;

    //some logic
    const result = await authService.confirmEmail(code);
    // console.log(result.status);
    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).json({
        errorsMessages: result.extensions,
      });
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-email-resending',
  inputValidation,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    //some logic
    const user = await usersRepository.findByLoginOrEmail(email);
    if (!user) {
      res.status(400).send({
        errorsMessages: [{ field: 'email', message: 'User not found' }],
      });
      return;
    }
    if (user.emailConfirmation.isConfirmed) {
      res.status(400).send({
        errorsMessages: [
          { field: 'email', message: 'Email already confirmed' },
        ],
      });
      return;
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
authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.jwt;
  const user = await jwtService.verifyToken(refreshToken);
  if (!user) {
    res.status(401).send({
      errorsMessages: [{ field: 'email', message: 'User not found' }],
    });
    return;
  }
  const newAccessToken = await jwtService.createToken(user.userId);
  const newRefreshToken = await jwtService.createRefreshToken(user.userId);

  res.cookie('jwt', newRefreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(HttpStatuses.Success).send({ accessToken: newAccessToken });
});
authRouter.post(
  '/logout',
  async (req: RequestWithBody<LoginInputModel>, res: Response) => {
    const refreshToken = req.cookies.jwt;
    res.status(HttpStatuses.Success).send();
  },
);
