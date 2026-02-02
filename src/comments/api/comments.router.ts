import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { CommentRepository } from '../infrastructure/comments.repository';
import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';
import { CommentService } from '../domain/comments.service';
import { bodyValidation } from './middlewares/body.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { commentExistMiddleware } from './middlewares/comment.exist.middleware';
import { commentOwnerMiddleware } from './middlewares/comment.owner.middleware';
import { optionalAccessTokenGuard } from '../../auth/api/guards/optional.access.token.guard';
import { likeStatusValidation } from './middlewares/like.status.validaton';

export const commentsRouter = Router();

export class CommentController {
  private commentService: CommentService;
  constructor() {
    this.commentService = new CommentService();
  }
  async getCommentById(req: Request, res: Response) {
    const currentUserId = req.user?.id;

    const comment = await this.commentService.getCommentById(
      req.params.id,
      currentUserId,
    );

    if (!comment) {
      return res.sendStatus(404);
    }

    res.status(200).send(comment);
  }
  async delete(req: Request, res: Response) {
    await this.commentService.delete(req.params.id);
    res.sendStatus(204);
  }
  async updateComment(req: Request, res: Response) {
    await this.commentService.update(req.params.id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  }
  async setLikeStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    await this.commentService.setLikeStatus(
      req.params.id,
      userId,
      req.body.likeStatus,
    );
    res.sendStatus(HttpStatus.NoContent);
  }
}

const commentControllerInstance = new CommentController();

commentsRouter.get(
  '/:id',
  optionalAccessTokenGuard,
  commentControllerInstance.getCommentById.bind(commentControllerInstance),
);

commentsRouter.delete(
  '/:id',
  accessTokenGuard,
  commentExistMiddleware,
  commentOwnerMiddleware,
  commentControllerInstance.delete.bind(commentControllerInstance),
);

commentsRouter.put(
  '/:id',
  accessTokenGuard,
  commentExistMiddleware,
  commentOwnerMiddleware,
  bodyValidation,
  inputValidation,
  commentControllerInstance.updateComment.bind(commentControllerInstance),
);

commentsRouter.put(
  '/:id/like-status',
  accessTokenGuard,
  commentExistMiddleware,
  likeStatusValidation,
  // commentOwnerMiddleware,
  // bodyValidation,
  inputValidation,
  commentControllerInstance.setLikeStatus.bind(commentControllerInstance),
);
