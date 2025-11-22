import { Request, Response, Router } from 'express';
import { BlogInputModel } from '../dto/blog.input';
import { blogInputValidation } from '../validation/BlogInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Blog } from '../types/blog';
import { db } from '../../db/in-memory.db';
import { superAdminGuardMiddleware } from '../../posts/middlewares/super-admin.guard-middleware';
import { client } from '../../db/mongo.db';
import { Collection } from 'mongodb';
import { blogsCollection } from '../../db/collections';

export const blogsRouter = Router({});

// blogs.router.ts
blogsRouter
  .get('', async (req: Request, res: Response<Blog[]>) => {
    const blogs = await blogsCollection.find({}).toArray();

    const mapped = blogs.map(({ _id, ...rest }) => rest);

    res.status(200).send(mapped);
  })

  .get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = await blogsCollection.findOne({ id: id });

    if (!blog) {
      res
        .status(404)
        .send(
          createErrorMessages([{ field: 'id', message: 'blog not found' }]),
        );
      return;
    }
    const { _id, ...mappedBlog } = blog;
    res.status(200).send(mappedBlog);
  })

  .post(
    '',
    superAdminGuardMiddleware,
    async (req: Request<{}, {}, BlogInputModel>, res: Response) => {
      const errors = blogInputValidation(req.body);

      console.log(' Validation errors count:', errors.length);
      console.log(' Validation errors:', errors);

      if (errors.length > 0) {
        console.log(' Sending 400 Bad Request');
        res.status(400).send(createErrorMessages(errors));
        return;
      }
      const createdAt = new Date();
      const newblog: Blog = {
        id: new Date().toISOString(),
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        createdAt: createdAt.toISOString(),
        isMembership: false,
      };
      await blogsCollection.insertOne(newblog);
      const mapnewblog: Blog = {
        id: newblog.id,
        name: newblog.name,
        description: newblog.description,
        websiteUrl: newblog.websiteUrl,
        createdAt: newblog.createdAt,
        isMembership: false,
      };
      res.status(201).send(mapnewblog);
    },
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request<{ id: string }, {}, BlogInputModel>, res: Response) => {
      const id = req.params.id;
      const blog = await blogsCollection.findOne({ id: id });

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
      await blogsCollection.updateOne(
        { id: id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
          },
        },
      );
      res.sendStatus(204);
    },
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request<{ id: string }>, res: Response) => {
      const id = req.params.id;
      const result = await blogsCollection.deleteOne({ id: id });
      // const index = db.blogs.findIndex((v) => v.id === id);

      if (result.deletedCount === 0) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'blog not found' }]),
          );
        return;
      }
      res.sendStatus(204);
    },
  );
