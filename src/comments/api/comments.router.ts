import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { commentsRepository } from '../infrastructure/comments.repository';
import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';
import { commentsService } from '../domain/comments.service';
import { bodyValidation } from './middlewares/body.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { commentExistMiddleware } from './middlewares/comment.exist.middleware';
import { commentOwnerMiddleware } from './middlewares/comment.owner.middleware';
import { objectIdValidation } from './middlewares/objectId.validation.middleware';
import { postsQwRepository } from '../../posts/repositories/post.query.repository';

export const commentsRouter = Router();

commentsRouter.get('/:id', async (req, res) => {
  const comment = await commentsRepository.findById(req.params.id);
  if (!comment) {
    res.sendStatus(404);
    return;
  }
  res.status(200).send(postsQwRepository._getInViewComment(comment));
});

commentsRouter.delete(
  '/:id',
  accessTokenGuard,
  commentExistMiddleware,
  commentOwnerMiddleware,
  async (req: Request, res: Response) => {
    await commentsService.delete(req.params.id);
    res.sendStatus(204);
  },
);

commentsRouter.put(
  '/:id',
  accessTokenGuard,
  commentExistMiddleware,
  commentOwnerMiddleware,
  bodyValidation,
  inputValidation,
  async (req: Request, res: Response) => {
    await commentsRepository.update(req.params.id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  },
);

commentsRouter.put(
  '/:id/like-status',
  accessTokenGuard,
  commentExistMiddleware,
  commentOwnerMiddleware,
  bodyValidation,
  inputValidation,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await commentsService.setLikeStatus(
      req.params.id,
      userId,
      req.body.likeStatus,
    );
    res.sendStatus(HttpStatus.NoContent);
  },
);
