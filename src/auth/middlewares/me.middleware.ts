import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { usersQwRepository } from '../../users/infrastructure/user.query.repo';

export const meMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id as string;
  if (!userId) {
    return res.sendStatus(HttpStatuses.Unauthorized);
  }
  const me = await usersQwRepository.findById2(userId);
  res.status(HttpStatuses.Success).send(me);

  next();
};
