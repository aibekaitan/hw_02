import { Request, Response, Router } from 'express';
import { BlogInputModel } from '../dto/blog.input';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Blog } from '../types/blog';
import { superAdminGuardMiddleware } from '../../posts/middlewares/super-admin.guard-middleware';
import { blogsRepository } from '../repositories/blogs-repository';
import {
  mapToBlogOutput,
  mapToBlogsOutput,
} from '../mappers/map-blog-to-output';
import {
  blogsMiddlewares,
  validateBlogInput,
} from '../middlewares/blogs-middlewares';

export const blogsRouter = Router({});

// blogs.router.ts
blogsRouter
  .get('', async (req: Request, res: Response<Blog[]>) => {
    // const blogs = await blogsCollection.find({}).toArray();
    const blogs = await blogsRepository.findAllBlogs();
    const mapped = mapToBlogsOutput(blogs);
    res.status(HttpStatus.Ok).send(mapped);
  })

  .get('/:id', async (req: Request, res: Response) => {
    const blog = await blogsMiddlewares(req, res);
    if (!blog) return;
    res.status(HttpStatus.Ok).send(mapToBlogOutput(blog));
  })

  .post(
    '',
    superAdminGuardMiddleware,
    validateBlogInput,
    async (req: Request<{}, {}, BlogInputModel>, res: Response) => {
      const newblog = await blogsRepository.create(req.body);
      // await blogsCollection.insertOne(newblog);
      res.status(HttpStatus.Created).send(mapToBlogOutput(newblog));
    },
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    validateBlogInput,
    async (req: Request<{ id: string }, {}, BlogInputModel>, res: Response) => {
      const id = req.params.id;
      const blog = await blogsMiddlewares(req, res);
      if (!blog) return;
      await blogsRepository.update(id, req.body);
      res.sendStatus(HttpStatus.NoContent);
    },
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request<{ id: string }>, res: Response) => {
      const result = await blogsRepository.delete(req.params.id);
      // const index = db.blogs.findIndex((v) => v.id === id);

      if (result.deletedCount === 0) {
        res
          .status(HttpStatus.NotFound)
          .send(
            createErrorMessages([{ field: 'id', message: 'blog not found' }]),
          );
        return;
      }
      res.sendStatus(HttpStatus.NoContent);
    },
  );
