import { NextFunction, Request, Response } from 'express';
// import { commentsRepository } from '../../infrastructure/comments.repository';
// import { HttpStatus } from '../../../core/types/http-statuses';
// import { createErrorMessages } from '../../../core/utils/error.utils';
import { ObjectId } from 'mongodb';

export async function objectIdValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  next();
}
