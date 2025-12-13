import { Response, Router } from 'express';
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

export const authRouter = Router();

authRouter.post(
  '',
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
    }

    res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  },
);
authRouter.get(
  '/auth/me',
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) res.sendStatus(HttpStatuses.Unauthorized);
    const me = await usersQwRepository.findById(userId);

    res.status(HttpStatuses.Success).send(me);
  },
);
