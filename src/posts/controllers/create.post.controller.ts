import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { mapToPostOutput } from '../mappers/map-post-to-output';
import { postsRepository } from '../repositories/posts-repository';

export const createPostController = async (req: Request, res: Response) => {
  const blog = (req as any).blog;
  const post = await postsRepository.create(req.body, blog.name);
  res.status(HttpStatus.Created).send(mapToPostOutput(post));
};
