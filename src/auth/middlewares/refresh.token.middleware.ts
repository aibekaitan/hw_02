import { NextFunction, Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../common/types/httpStatuses';

export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  next();
};
