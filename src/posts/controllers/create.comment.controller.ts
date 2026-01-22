import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { postsRepository } from '../repositories/posts-repository';
import { postsQwRepository } from '../repositories/post.query.repository';

export const createCommentController = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  const currentUserId = req.user.id;

  const createdComment = await postsRepository.createComment(
    req.body,
    req.params.id,
    currentUserId,
  );

  const viewModel = await postsQwRepository._getInViewComment(
    createdComment,
    currentUserId,
  );

  res.status(HttpStatus.Created).json(viewModel);
};
