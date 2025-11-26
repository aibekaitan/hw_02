import { NextFunction } from 'express';
import { createErrorMessages } from '../../core/utils/error.utils';
import { blogsRepository } from '../repositories/blogs-repository';
import { Request, Response } from 'express';
import { blogInputValidation } from '../validation/BlogInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';

export async function blogsMiddlewares(req: Request, res: Response) {
  const blog = await blogsRepository.findById(req.params.id);
  if (!blog) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'blog not found' }]));
    return null;
  }

  return blog;
}

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
