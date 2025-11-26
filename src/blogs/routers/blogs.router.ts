import { Request, Response, Router } from 'express';
import { BlogInputModel } from '../dto/blog.input';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { superAdminGuardMiddleware } from '../../posts/middlewares/super-admin.guard-middleware';
import { blogsService } from '../domain/blogs-service';
import { mapToBlogOutput } from '../mappers/map-blog-to-output';
import {
  blogsMiddlewares,
  validateBlogInput,
} from '../middlewares/blogs-middlewares';
import { BlogPaginator } from '../types/paginator';
import { mapToPostOutput } from '../../posts/mappers/map-post-to-output';

export const blogsRouter = Router({});

// blogs.router.ts
blogsRouter
  .get(
    '',
    // paginationAndSortingValidation(),
    async (req: Request, res: Response<BlogPaginator>) => {
      // const blogs = await blogsCollection.find({}).toArray();
      const pageNumber = Number(req.query.pageNumber) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortDirection =
        (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
      const searchNameTerm = (req.query.searchNameTerm as string) || null;

      const result = await blogsService.findAllBlogs({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
      });
      res.status(HttpStatus.Ok).send(result);
    },
  )
  .get('/:blogId/posts', async (req: Request, res: Response) => {
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection =
      (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
    const result = await blogsService.findPostsByBlogId(req.params.blogId, {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });
    if (result.items.length === 0) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: 'blogId', message: 'blogId not found' },
          ]),
        );
      return;
    }
    res.status(HttpStatus.Ok).send(result);
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
      // debugger;
      const newblog = await blogsService.create(req.body);
      // await blogsCollection.insertOne(newblog);
      res.status(HttpStatus.Created).send(mapToBlogOutput(newblog));
    },
  )

  .post(
    '/:blogId/posts',
    superAdminGuardMiddleware,
    async (req: Request, res: Response) => {
      // debugger;
      // const blog = (req as any).blog;
      const newPost = await blogsService.createByBlogId(
        req.params.blogId,
        req.body,
      );
      if (!newPost) {
        res
          .status(HttpStatus.NotFound)
          .send(
            createErrorMessages([
              { field: 'blogId', message: 'blogId not found' },
            ]),
          );
        return;
      }
      // await blogsCollection.insertOne(newblog);
      res.status(HttpStatus.Created).send(mapToPostOutput(newPost));
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
      await blogsService.update(id, req.body);
      res.sendStatus(HttpStatus.NoContent);
    },
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request<{ id: string }>, res: Response) => {
      const result = await blogsService.delete(req.params.id);
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
