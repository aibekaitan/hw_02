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

export const commentsRouter = Router();

commentsRouter.get('/:id', async (req, res) => {
  const comment = await commentsRepository.findById2(req.params.id);
  if (!comment) {
    res.sendStatus(404);
    return;
  }
  res.status(200).send(comment);
});

commentsRouter.delete(
  '/:id',
  accessTokenGuard,
  objectIdValidation,
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
  bodyValidation,
  inputValidation,
  commentExistMiddleware,
  commentOwnerMiddleware,
  async (req: Request, res: Response) => {
    await commentsRepository.update(req.params.id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  },
);
