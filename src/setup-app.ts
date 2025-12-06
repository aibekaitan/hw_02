import express, { Express, Request, Response } from 'express';
import { driversRouter } from './drivers/routers/drivers.router';
import { testingRouter } from './testing/routers/testing.router';
import { videosRouter } from './videos/routers/videos.router';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { usersRouter } from './users/api/users.router';
import { authRouter } from './auth/api/auth.router';

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get('/', (req: Request, res: Response) => {
    res.status(200).send('hello world!!!');
  });

  app.use('/drivers', driversRouter);
  app.use('/videos', videosRouter);
  app.use('/testing', testingRouter);
  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/users', usersRouter);
  app.use('/auth/login', authRouter);
  // setupSwagger(app);
  return app;
};
