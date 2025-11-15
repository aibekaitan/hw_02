import { ValidationError } from '../../drivers/types/validationError';
import { PostInputModel } from '../dto/post.input';

const WEBSITE_URL_REGEX =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const postInputValidation = (
  data: PostInputModel,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const { title, shortDescription, content, blogId } = data;

  // title validation
  if (
    !title ||
    typeof title !== 'string' ||
    title.trim().length < 2 ||
    title.trim().length > 30
  ) {
    errors.push({ field: 'title', message: 'Invalid title' });
  }

  // shortDescription validation
  if (
    !shortDescription ||
    typeof shortDescription !== 'string' ||
    shortDescription.trim().length < 2 ||
    shortDescription.trim().length > 100
  ) {
    errors.push({
      field: 'shortDescription',
      message: 'Invalid shortDescription',
    });
  }

  if (
    !content ||
    typeof content !== 'string' ||
    content.trim().length < 2 ||
    content.trim().length > 1000
  ) {
    errors.push({
      field: 'content',
      message: 'Invalid content',
    });
  }

  return errors;
};
