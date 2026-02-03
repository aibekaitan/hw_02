import { Router } from 'express';

import { accessTokenGuard } from '../../auth/api/guards/access.token.guard';

import { bodyValidation } from './middlewares/body.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { commentExistMiddleware } from './middlewares/comment.exist.middleware';
import { commentOwnerMiddleware } from './middlewares/comment.owner.middleware';
import { optionalAccessTokenGuard } from '../../auth/api/guards/optional.access.token.guard';
import { likeStatusValidation } from './middlewares/like.status.validaton';
import { commentControllerInstance } from '../../composition-root';

export const commentsRouter = Router();

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
