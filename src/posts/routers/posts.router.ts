import { Router } from 'express';
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
import { optionalAccessTokenGuard } from '../../auth/api/guards/optional.access.token.guard';
import { likeStatusValidation } from '../../comments/api/middlewares/like.status.validaton';
import { postControllerInstance } from '../../composition-root';

export const postsRouter = Router();

postsRouter
  .get(
    '',
    optionalAccessTokenGuard,
    postControllerInstance.getAllPosts.bind(postControllerInstance),
  )
  .get(
    '/:id',
    optionalAccessTokenGuard,
    postControllerInstance.getPost.bind(postControllerInstance),
  )
  .post(
    '',
    superAdminGuardMiddleware,
    validatePostInput,
    validateBlogExists,
    postControllerInstance.createPostController.bind(postControllerInstance),
  )
  .post(
    '/:id/comments',
    accessTokenGuard,
    validatePostExists,
    bodyValidation,
    inputValidation,
    postControllerInstance.createComment.bind(postControllerInstance),
  )
  .get(
    '/:id/comments',
    optionalAccessTokenGuard,
    validatePostExists,
    pageNumberValidation,
    postControllerInstance.getCommentsByPostId.bind(postControllerInstance),
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    validatePostInput,
    postControllerInstance.updatePost.bind(postControllerInstance),
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    postControllerInstance.deletePost.bind(postControllerInstance),
  )
  .put(
    '/:id/like-status',
    accessTokenGuard,
    validatePostExists,
    likeStatusValidation,
    inputValidation,
    postControllerInstance.updateLikeStatusOfPost.bind(postControllerInstance),
  );
