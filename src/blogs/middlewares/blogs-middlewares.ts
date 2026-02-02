import { NextFunction } from 'express';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Request, Response } from 'express';
import { blogInputValidation } from '../validation/BlogInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';

export const validateBlogInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = blogInputValidation(req.body);
  // console.log(' Validation errors count:', errors.length);
  // console.log(' Validation errors:', errors);
  if (errors.length > 0) {
    // console.log(' Sending 400 Bad Request');
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }
  next();
};
export const validateBlogQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = blogInputValidation(req.body);
  // console.log(' Validation errors count:', errors.length);
  // console.log(' Validation errors:', errors);
  if (errors.length > 0) {
    // console.log(' Sending 400 Bad Request');
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }
  next();
};
