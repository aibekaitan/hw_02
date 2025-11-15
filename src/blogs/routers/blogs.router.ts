import { Request, Response, Router } from 'express';
import { BlogInputModel } from '../dto/blog.input';
import { blogInputValidation } from '../validation/BlogInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Blog } from '../types/blog';
import { db } from '../../db/in-memory.db';
import { superAdminGuardMiddleware } from '../../posts/middlewares/super-admin.guard-middleware';

export const blogsRouter = Router({});

// blogs.router.ts
blogsRouter
  .get('', (req: Request, res: Response<Blog[]>) => {
    res.status(200).send(db.blogs);
  })

  .get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = db.blogs.find((d) => d.id === id);

    if (!blog) {
      res
        .status(404)
        .send(
          createErrorMessages([{ field: 'id', message: 'blog not found' }]),
        );
      return;
    }
    res.status(200).send(blog);
  })

  .post(
    '',
    superAdminGuardMiddleware,
    (req: Request<{}, {}, BlogInputModel>, res: Response) => {
      const errors = blogInputValidation(req.body);

      console.log(' Validation errors count:', errors.length);
      console.log(' Validation errors:', errors);

      if (errors.length > 0) {
        console.log(' Sending 400 Bad Request');
        res.status(400).send(createErrorMessages(errors));
        return;
      }

      const newblog: Blog = {
        id: new Date().toISOString(),
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
      };

      db.blogs.push(newblog);
      res.status(201).send(newblog);
    },
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    (req: Request<{ id: string }, {}, BlogInputModel>, res: Response) => {
      const id = req.params.id;
      const blog = db.blogs.find((v) => v.id === id);

      if (!blog) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'blog not found' }]),
          );
        return;
      }

      const errors = blogInputValidation(req.body);

      if (errors.length > 0) {
        res.status(400).send(createErrorMessages(errors));
        return;
      }
      blog.name = req.body.name;
      blog.description = req.body.description;
      blog.websiteUrl = req.body.websiteUrl;

      res.sendStatus(204);
    },
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    (req: Request<{ id: string }>, res: Response) => {
      const id = req.params.id;
      const index = db.blogs.findIndex((v) => v.id === id);

      if (index === -1) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'blog not found' }]),
          );
        return;
      }

      db.blogs.splice(index, 1);
      res.sendStatus(204);
    },
  );
