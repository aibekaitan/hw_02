import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../common/types/id';

export const accessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ')[1];

  if (authType !== 'Bearer') {
    res.sendStatus(401);
    return;
  }

  const payload = await jwtService.verifyToken(token);
  if (payload) {
    const { userId } = payload;

    req.user = { id: userId } as IdType;
    next();
    return;
  }
  res.sendStatus(401);
};
