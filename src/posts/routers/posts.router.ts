import { Router, Request, Response } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { superAdminGuardMiddleware } from '../middlewares/super-admin.guard-middleware';
import {
  postsMiddlewares,
  validateBlogExists,
  validatePostInput,
} from '../middlewares/posts-middlewares';
import { HttpStatus } from '../../core/types/http-statuses';
import { mapToPostOutput } from '../mappers/map-post-to-output';
import { baseAuthGuard } from '../../auth/api/guards/base.auth.guard';
import { pageNumberValidation } from '../../common/validation/sorting.pagination.validation';
import {
  ParamsType,
  RequestWithParamsAndQuery,
  RequestWithQuery,
} from '../../common/types/requests';
import { UsersQueryFieldsType } from '../../users/types/users.queryFields.type';
import { IPagination } from '../../common/types/pagination';
import { IUserView } from '../../users/types/user.view.interface';
import { sortQueryFieldsUtil } from '../../common/utils/sortQueryFields.util';
import { usersQwRepository } from '../../users/infrastructure/user.query.repo';
import { CommentViewModel } from '../../comments/types/comments.dto';
import { CommentsQueryFieldsType } from '../types/comments.queryFields.type';
import { postsQwRepository } from '../repositories/post.query.repository';
import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';
import { mapToCommentOutput } from '../../comments/utils/map.comment.without.id';
import { bodyValidation } from '../middlewares/body.validation';
import { inputValidation } from '../../common/validation/input.validation';

export const postsRouter = Router();

postsRouter
  .get('', async (req: Request, res: Response) => {
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection =
      (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
    // const searchNameTerm = (req.query.searchNameTerm as string) || null;

    const result = await postsRepository.findAll({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });
    res.status(HttpStatus.Ok).send(result);
  })
  .get('/:id', async (req: Request, res: Response) => {
    const post = await postsMiddlewares(req, res);
    if (!post) return;
    res.status(HttpStatus.Ok).send(mapToPostOutput(post));
  })
  .post(
    '',
    superAdminGuardMiddleware,
    validatePostInput,
    validateBlogExists,
    async (req: Request, res: Response) => {
      const blog = (req as any).blog;
      const post = await postsRepository.create(req.body, blog.name);
      res.status(HttpStatus.Created).send(mapToPostOutput(post));
    },
  )
  .post(
    '/:postId/comments',
    accessTokenGuard,
    bodyValidation,
    inputValidation,
    async (req: Request, res: Response) => {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }
      const comment = await postsRepository.createComment(
        req.body,
        req.params.postId,
        req.user.id,
      );
      postsQwRepository._getInViewComment2(comment);
      res
        .status(HttpStatus.Created)
        .send(postsQwRepository._getInViewComment2(comment));
    },
  )
  .get(
    '/:id/comments',
    baseAuthGuard,
    pageNumberValidation,
    async (
      req: RequestWithParamsAndQuery<ParamsType, CommentsQueryFieldsType>,
      res: Response<IPagination<CommentViewModel[]>>,
    ) => {
      const { pageNumber, pageSize, sortBy, sortDirection } =
        sortQueryFieldsUtil(req.query);
      const allComments = await postsQwRepository.findAllCommentsByPostId(
        req.params.id,
        {
          searchLoginTerm: req.query.searchLoginTerm,
          searchEmailTerm: req.query.searchEmailTerm,
          pageNumber,
          pageSize,
          sortBy,
          sortDirection,
        },
      );

      res.status(200).send(allComments);
    },
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    validatePostInput,
    async (req: Request, res: Response) => {
      const post = await postsMiddlewares(req, res);
      if (!post) return;

      await postsRepository.update(req.params.id, req.body);
      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    async (req: Request, res: Response) => {
      const post = await postsMiddlewares(req, res);
      if (!post) return;

      await postsRepository.delete(req.params.id);
      res.sendStatus(HttpStatus.NoContent);
    },
  );
