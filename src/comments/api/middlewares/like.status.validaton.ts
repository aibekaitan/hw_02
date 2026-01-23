import { body } from 'express-validator';

export const likeStatusValidation = body('likeStatus')
  .trim()
  .notEmpty()
  .withMessage('likeStatus is required')
  .isIn(['Like', 'Dislike', 'None'])
  .withMessage('likeStatus must be Like, Dislike or None');
