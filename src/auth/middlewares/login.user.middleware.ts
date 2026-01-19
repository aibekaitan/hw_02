import { NextFunction, Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../common/types/httpStatuses';

export const loginUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { loginOrEmail, password } = req.body;

  const ip = req.ip || 'unknown';
  const title = req.headers['user-agent'] || 'Unknown device';

  const result = await authService.loginUser(loginOrEmail, password, ip, title);

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

  next();
};
