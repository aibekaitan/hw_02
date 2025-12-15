import { NextFunction, Request, Response } from 'express';
import { commentsRepository } from '../../infrastructure/comments.repository';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function commentOwnerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.comment.commentatorInfo.userId !== req.user?.id) {
    res.status(HttpStatus.Forbidden);
    return;
  }
  next();
}
