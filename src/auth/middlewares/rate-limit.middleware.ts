import { Request, Response, NextFunction } from 'express';
import { RequestLogModel } from '../../models/request.logs.model';
// import { requestLogsCollection } from '../../db/collections';

const REQUEST_LIMIT = 5;
const TIME_WINDOW_MS = 10 * 1000;

export const requestLoggerAndLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip || 'unknown';
  const url = req.originalUrl || req.baseUrl + req.path;
  const now = new Date();
  await RequestLogModel.create({
    ip,
    url,
    date: now,
    method: req.method,
    // userId: req.user?.id
  });
  const tenSecondsAgo = new Date(now.getTime() - TIME_WINDOW_MS);

  const count = await RequestLogModel.countDocuments({
    ip,
    url,
    date: { $gte: tenSecondsAgo },
  });

  if (count > REQUEST_LIMIT) {
    return res.status(429).json({
      errorsMessages: [
        {
          message: 'More than 5 attempts from one IP-address during 10 seconds',
        },
      ],
    });
  }

  next();
};
