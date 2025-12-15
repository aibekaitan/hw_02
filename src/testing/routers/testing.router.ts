import { Router, Request, Response } from 'express';
// import { db } from '../../db/in-memory.db';
import { HttpStatus } from '../../core/types/http-statuses';
import {
  blogsCollection,
  commentsCollection,
  postsCollection,
  usersCollection,
} from '../../db/collections';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  // db.drivers = [];
  // db.videos = [];
  // db.posts = [];
  // db.blogs = [];
  await blogsCollection.deleteMany({});
  await postsCollection.deleteMany({});
  await usersCollection.deleteMany({});
  await commentsCollection.deleteMany({});
  res.sendStatus(HttpStatus.NoContent);
});
