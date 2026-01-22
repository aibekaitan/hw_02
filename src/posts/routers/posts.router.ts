import { Router, Request, Response } from 'express';
import { superAdminGuardMiddleware } from '../middlewares/super-admin.guard-middleware';
import {
  validateBlogExists,
  validatePostExists,
  validatePostInput,
} from '../middlewares/posts-middlewares';
import { pageNumberValidation } from '../../common/validation/sorting.pagination.validation';
import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';
import { bodyValidation } from '../middlewares/body.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { getAllPostsController } from '../controllers/get.all.posts.controller';
import { getPostController } from '../controllers/get.post.controller';
import { createPostController } from '../controllers/create.post.controller';
import { createCommentController } from '../controllers/create.comment.controller';
import { getCommentsByPostIdController } from '../controllers/get.all.comments.by.postid.controller';
import { updatePostController } from '../controllers/update.post.controller';
import { deletePostController } from '../controllers/delete.post.controller';

export const postsRouter = Router();

postsRouter
  .get('', getAllPostsController)
  .get('/:id', getPostController)
  .post(
    '',
    superAdminGuardMiddleware,
    validatePostInput,
    validateBlogExists,
    createPostController,
  )
  .post(
    '/:id/comments',
    accessTokenGuard,
    validatePostExists,
    bodyValidation,
    inputValidation,
    createCommentController,
  )
  .get(
    '/:id/comments',
    validatePostExists,
    pageNumberValidation,
    getCommentsByPostIdController,
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    validatePostInput,
    updatePostController,
  )
  .delete('/:id', superAdminGuardMiddleware, deletePostController);
