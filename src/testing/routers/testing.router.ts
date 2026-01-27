import { Router, Request, Response } from 'express';
// import { db } from '../../db/in-memory.db';
import { HttpStatus } from '../../core/types/http-statuses';
import { BlogModel } from '../../models/blog.model';
import { PostModel } from '../../models/post.model';
import { UserModel } from '../../models/user.model';
import { CommentModel } from '../../models/comment.model';
import { DeviceModel } from '../../models/security.devices.model';
import { RequestLogModel } from '../../models/request.logs.model';
import { LikeModel } from '../../models/like.model';
// import {
//   blogsCollection,
//   commentsCollection,
//   postsCollection,
//   requestLogsCollection,
//   securityDevicesCollection,
//   usersCollection,
// } from '../../db/collections';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  // db.drivers = [];
  // db.videos = [];
  // db.posts = [];
  // db.blogs = [];
  try {
    await Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      RequestLogModel.deleteMany({}),
      LikeModel.deleteMany({}),
    ]);

    res.sendStatus(HttpStatus.NoContent);
  } catch (err) {
    console.error('Error clearing all data:', err);
    res.sendStatus(500);
  }
});
