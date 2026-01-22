import { NextFunction, Request, Response } from 'express';
import { postsMiddlewares } from '../middlewares/posts-middlewares';
import { postsRepository } from '../repositories/posts-repository';
import { HttpStatus } from '../../core/types/http-statuses';

export const deletePostController = async (req: Request, res: Response) => {
  const post = await postsMiddlewares(req, res);
  if (!post) return;

  await postsRepository.delete(req.params.id);
  res.sendStatus(HttpStatus.NoContent);
};
