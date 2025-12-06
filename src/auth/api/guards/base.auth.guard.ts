import { NextFunction, Request, Response } from 'express';

export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASS = 'qwerty';
export const ADMIN_TOKEN = Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASS}`).toString(
  'base64',
);

export const baseAuthGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.sendStatus(401);
    return;
  }

  const [authType, token] = auth.split(' ');
  if (authType !== 'Basic') return res.sendStatus(401);
  if (token !== ADMIN_TOKEN) {
    res.sendStatus(401);
    return;
  }

  next();
};
