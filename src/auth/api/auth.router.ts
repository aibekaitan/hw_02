import { Response, Router } from 'express';
import { RequestWithBody } from '../../common/types/requests';
import { LoginInputModel } from '../types/login.dto';
import { authService } from '../domain/auth.service';
import { passwordValidation } from '../../users/api/middlewares/password.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { loginOrEmailValidation } from '../../users/api/middlewares/login.or.email.valid';
import { HttpStatus } from '../../core/types/http-statuses';

export const authRouter = Router();

authRouter.post(
  '',
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  async (req: RequestWithBody<LoginInputModel>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const accessToken = await authService.loginUser(loginOrEmail, password);
    if (!accessToken) {
      res.sendStatus(HttpStatus.Unauthorized);
    }

    res.status(HttpStatus.NoContent).send({ accessToken });
  },
);
