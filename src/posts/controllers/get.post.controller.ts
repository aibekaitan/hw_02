import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { postsMiddlewares } from '../middlewares/posts-middlewares';
import { mapToPostOutput } from '../mappers/map-post-to-output';

export const getPostController = async (req: Request, res: Response) => {
  const post = await postsMiddlewares(req, res);
  if (!post) return;
  res.status(HttpStatus.Ok).send(post);
};
