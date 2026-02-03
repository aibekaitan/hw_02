import { Router } from 'express';
import { superAdminGuardMiddleware } from '../../posts/middlewares/super-admin.guard-middleware';
import { validateBlogInput } from '../middlewares/blogs-middlewares';
import { validatePostInput } from '../../posts/middlewares/posts-middlewares';
import { optionalAccessTokenGuard } from '../../auth/api/guards/optional.access.token.guard';

import { blogControllerInstance } from '../../composition-root';

export const blogsRouter = Router({});

// blogs.router.ts
blogsRouter
  .get(
    '',
    // paginationAndSortingValidation(),
    blogControllerInstance.getAllBlogs.bind(blogControllerInstance),
  )
  .get(
    '/:blogId/posts',
    optionalAccessTokenGuard,
    blogControllerInstance.getPostsByBlogId.bind(blogControllerInstance),
  )

  .get('/:id', blogControllerInstance.getBlogById.bind(blogControllerInstance))

  .post(
    '',
    superAdminGuardMiddleware,
    validateBlogInput,
    blogControllerInstance.createBlog.bind(blogControllerInstance),
  )

  .post(
    '/:blogId/posts',
    superAdminGuardMiddleware,
    validatePostInput,
    blogControllerInstance.createPostByBlogId.bind(blogControllerInstance),
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    validateBlogInput,
    blogControllerInstance.updateBlogById.bind(blogControllerInstance),
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    blogControllerInstance.deleteBlog.bind(blogControllerInstance),
  );
