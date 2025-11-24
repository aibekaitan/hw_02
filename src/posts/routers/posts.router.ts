import { Router, Request, Response } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { superAdminGuardMiddleware } from '../middlewares/super-admin.guard-middleware';
import {
  postsMiddlewares,
  validateBlogExists,
  validatePostInput,
} from '../middlewares/posts-middlewares';
import { HttpStatus } from '../../core/types/http-statuses';
import {
  mapToPostOutput,
  mapToPostsOutput,
} from '../mappers/map-post-to-output';

export const postsRouter = Router();

postsRouter
  .get('', async (req: Request, res: Response) => {
    const posts = await postsRepository.findAll();
    res.status(HttpStatus.Ok).send(mapToPostsOutput(posts));
  })
  .get('/:id', async (req: Request, res: Response) => {
    const post = await postsMiddlewares(req, res);
    if (!post) return;
    res.status(HttpStatus.Ok).send(mapToPostOutput(post));
  })
  .post(
    '',
    superAdminGuardMiddleware,
    validatePostInput,
    validateBlogExists,
    async (req: Request, res: Response) => {
      const blog = (req as any).blog;
      const post = await postsRepository.create(req.body, blog.name);
      res.status(HttpStatus.Created).send(post);
    },
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    validatePostInput,
    async (req: Request, res: Response) => {
      const post = await postsMiddlewares(req, res);
      if (!post) return;

      await postsRepository.update(req.params.id, req.body);
      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request, res: Response) => {
      const post = await postsMiddlewares(req, res);
      if (!post) return;

      await postsRepository.delete(req.params.id);
      res.sendStatus(HttpStatus.NoContent);
    },
  );
