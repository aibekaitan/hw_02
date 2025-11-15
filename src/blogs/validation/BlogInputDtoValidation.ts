import { ValidationError } from '../../drivers/types/validationError';
import { BlogInputModel } from '../dto/blog.input';

const WEBSITE_URL_REGEX =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogInputValidation = (
  data: BlogInputModel,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const { name, description, websiteUrl } = data;

  // name validation
  if (
    !name ||
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 15
  ) {
    errors.push({ field: 'name', message: 'Invalid name' });
  }

  // description validation
  if (
    !description ||
    typeof description !== 'string' ||
    description.trim().length < 2 ||
    description.trim().length > 500
  ) {
    errors.push({ field: 'description', message: 'Invalid description' });
  }

  // websiteUrl validation
  if (
    !websiteUrl ||
    typeof websiteUrl !== 'string' ||
    websiteUrl.trim().length < 5 ||
    websiteUrl.trim().length > 100 ||
    !WEBSITE_URL_REGEX.test(websiteUrl)
  ) {
    errors.push({ field: 'websiteUrl', message: 'Invalid websiteUrl' });
  }

  return errors;
};
