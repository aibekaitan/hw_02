import { NextFunction, Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../common/types/httpStatuses';

export const newPasswordMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { recoveryCode, newPassword } = req.body;

  const result = await authService.changePassword(recoveryCode, newPassword);

  if (result.status !== ResultStatus.Success) {
    return res
      .status(resultCodeToHttpException(result.status))
      .json({ errorsMessages: result.extensions ?? [] });
  }

  res.sendStatus(HttpStatuses.NoContent);

  next();
};
