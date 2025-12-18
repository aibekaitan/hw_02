import { NextFunction, Request, Response } from 'express';
import { commentsRepository } from '../../infrastructure/comments.repository';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { mapToCommentOutput } from '../../utils/map.comment.without.id';

export async function commentExistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const comment = await commentsRepository.findById(req.params.id);
  if (!comment) {
    res
      .status(HttpStatus.NotFound)
      .send(
        createErrorMessages([{ field: 'id', message: 'comment not found' }]),
      );
    return;
  }
  req.comment = comment;
  next();
}
