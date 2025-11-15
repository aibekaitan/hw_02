import { Request, Response, Router } from 'express';
import { PostInputModel } from '../../posts/dto/post.input';
import { postInputValidation } from '../validation/PostInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Post } from '../types/post';
import { db } from '../../db/in-memory.db';
import { superAdminGuardMiddleware } from '../middlewares/super-admin.guard-middleware';

export const postsRouter = Router({});

// posts.router.ts
postsRouter
  .get('', (req: Request, res: Response<Post[]>) => {
    res.status(200).send(db.posts);
  })

  .get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const post = db.posts.find((d) => d.id === id);

    if (!post) {
      res
        .status(404)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
      return;
    }
    res.status(200).send(post);
  })

  .post(
    '',
    superAdminGuardMiddleware,
    (req: Request<{}, {}, PostInputModel>, res: Response) => {
      const errors = postInputValidation(req.body);
      console.log(' Validation errors count:', errors.length);
      console.log(' Validation errors:', errors);
      if (errors.length > 0) {
        console.log(' Sending 400 Bad Request');
        res.status(400).send(createErrorMessages(errors));
        return;
      }

      const id = req.body.blogId;
      const blog = db.blogs.find((v) => v.id === id);

      if (!blog) {
        res
          .status(404)
          .send(
            createErrorMessages([
              { field: 'blogId', message: 'blogId not found' },
            ]),
          );
        return;
      }
      const newPost: Post = {
        id: new Date().toISOString(),
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blog.id,
        blogName: blog.name,
      };

      db.posts.push(newPost);
      res.status(201).send(newPost);
    },
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    (req: Request<{ id: string }, {}, PostInputModel>, res: Response) => {
      const id = req.params.id;
      const post = db.posts.find((v) => v.id === id);

      if (!post) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'post not found' }]),
          );
        return;
      }

      const errors = postInputValidation(req.body);

      if (errors.length > 0) {
        res.status(400).send(createErrorMessages(errors));
        return;
      }
      post.title = req.body.title;
      post.shortDescription = req.body.shortDescription;
      post.content = req.body.content;
      post.blogId = req.body.blogId;

      res.sendStatus(204);
    },
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    (req: Request<{ id: string }>, res: Response) => {
      const id = req.params.id;
      const index = db.posts.findIndex((v) => v.id === id);

      if (index === -1) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'post not found' }]),
          );
        return;
      }

      db.posts.splice(index, 1);
      res.sendStatus(204);
    },
  );
