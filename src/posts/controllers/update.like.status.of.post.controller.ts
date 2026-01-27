import { NextFunction, Request, Response } from 'express';
import { postsMiddlewares } from '../middlewares/posts-middlewares';
import { postsRepository } from '../repositories/posts-repository';
import { HttpStatus } from '../../core/types/http-statuses';
import { commentsService } from '../../comments/domain/comments.service';

export const updateLikeStatusOfPostController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user!.id;
  await postsRepository.setLikeStatus(
    req.params.id,
    userId,
    req.body.likeStatus,
  );
  res.sendStatus(HttpStatus.NoContent);
};
