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
import { optionalAccessTokenGuard } from '../../auth/api/guards/optional.access.token.guard';
import { likeStatusValidation } from '../../comments/api/middlewares/like.status.validaton';
import { UserRepository } from '../../users/infrastructure/user.repository';
import { PostService } from '../domain/post.service';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import {
  CommentInputModel,
  CommentViewModel,
} from '../../comments/types/comments.dto';
import {
  ParamsType,
  RequestWithParamsAndQuery,
} from '../../common/types/requests';
import { CommentsQueryFieldsType } from '../types/comments.queryFields.type';
import { IPagination } from '../../common/types/pagination';

export const postsRouter = Router();

export class PostController {
  private postService: PostService;
  constructor() {
    this.postService = new PostService();
  }
  async getAllPosts(req: Request, res: Response) {
    const currentUserId = req.user?.id;

    const result = await this.postService.getAllPosts(req.query, currentUserId);

    res.status(HttpStatus.Ok).send(result);
  }
  async getPost(req: Request, res: Response) {
    const postId = req.params.id;
    const currentUserId = req.user?.id;

    const post = await this.postService.getPostById(postId, currentUserId);

    if (!post) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.status(HttpStatus.Ok).send(post);
  }
  async createPostController(req: Request, res: Response) {
    const blog = (req as any).blog;

    const post = await this.postService.createPost(req.body, blog.name);

    res.status(HttpStatus.Created).send(post);
  }
  async createComment(req: Request, res: Response) {
    if (!req.user) {
      return res.sendStatus(HttpStatus.Unauthorized);
    }

    const commentView = await this.postService.createComment(
      req.params.id,
      req.body,
      req.user.id,
    );

    res.status(HttpStatus.Created).send(commentView);
  }
  async getCommentsByPostId(
    req: RequestWithParamsAndQuery<ParamsType, CommentsQueryFieldsType>,
    res: Response<IPagination<CommentViewModel[]>>,
  ) {
    const currentUserId = req.user?.id;

    const comments = await this.postService.getCommentsByPostId(
      req.params.id,
      req.query,
      currentUserId,
    );

    res.status(200).send(comments);
  }
  async updatePost(req: Request, res: Response) {
    const updated = await this.postService.updatePost(req.params.id, req.body);

    if (!updated) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
  async updateLikeStatusOfPost(req: Request, res: Response) {
    const userId = req.user!.id;

    const updated = await this.postService.updateLikeStatus(
      req.params.id,
      userId,
      req.body.likeStatus,
    );

    if (!updated) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
  async deletePost(req: Request, res: Response) {
    const deleted = await this.postService.deletePost(req.params.id);

    if (!deleted) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
}
const postControllerInstance = new PostController();
postsRouter
  .get(
    '',
    optionalAccessTokenGuard,
    postControllerInstance.getAllPosts.bind(PostController),
  )
  .get(
    '/:id',
    optionalAccessTokenGuard,
    postControllerInstance.getPost.bind(PostController),
  )
  .post(
    '',
    superAdminGuardMiddleware,
    validatePostInput,
    validateBlogExists,
    postControllerInstance.createPostController.bind(PostController),
  )
  .post(
    '/:id/comments',
    accessTokenGuard,
    validatePostExists,
    bodyValidation,
    inputValidation,
    postControllerInstance.createComment.bind(PostController),
  )
  .get(
    '/:id/comments',
    optionalAccessTokenGuard,
    validatePostExists,
    pageNumberValidation,
    postControllerInstance.getCommentsByPostId.bind(PostController),
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    validatePostInput,
    postControllerInstance.updatePost.bind(PostController),
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    postControllerInstance.deletePost.bind(PostController),
  )
  .put(
    '/:id/like-status',
    accessTokenGuard,
    validatePostExists,
    likeStatusValidation,
    inputValidation,
    postControllerInstance.updateLikeStatusOfPost.bind(PostController),
  );
