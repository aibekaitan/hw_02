import { Request, Response, NextFunction } from 'express';
import { createErrorMessages } from '../../core/utils/error.utils';
import { HttpStatus } from '../../core/types/http-statuses';
import { postInputValidation } from '../validation/PostInputDtoValidation';
import { blogRepository } from '../../blogs/repositories/blogs-repository';
import { postRepository } from '../repositories/posts-repository';

export const validatePostInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = postInputValidation(req.body);
  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }
  next();
};
export const validateBlogExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const blogId = req.body.blogId;
  const blog = await blogRepository.findById(blogId);

  if (!blog) {
    res
      .status(HttpStatus.NotFound)
      .send(
        createErrorMessages([{ field: 'blogId', message: 'blogId not found' }]),
      );
    return;
  }

  // Можно положить блог в req, чтобы потом не искать заново
  (req as any).blog = blog;

  next();
};
export const validatePostExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const postId = req.params.id;
  const post = await postRepository.findById(postId);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound); // 404
    return;
  }
  next();
};
