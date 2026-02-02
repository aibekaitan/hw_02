import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { mapToCommentOutput } from '../../utils/map.comment.without.id';
import { commentRepository } from '../../infrastructure/comments.repository';

export async function commentExistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const comment = await commentRepository.findById(req.params.id);
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
