import { NextFunction, Request, Response } from 'express';
import { commentsRepository } from '../../infrastructure/comments.repository';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function commentOwnerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log('commentOwnerMiddleware → req.user?.id:', req.user?.id);
  console.log(
    'commentOwnerMiddleware → req.comment.commentatorInfo.userId:',
    req.comment.commentatorInfo.userId,
  );

  if (req.comment.commentatorInfo.userId !== req.user?.id) {
    console.log('⛔ Access denied: user is not the owner of the comment');
    res.status(HttpStatus.Forbidden).send({ message: 'Forbidden' });
    return;
  }

  console.log('✅ Access granted: user is the owner of the comment');
  next();
}
