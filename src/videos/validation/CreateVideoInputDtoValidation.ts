import { CreateVideoInputModel } from '../dto/video-create.input';
import { ValidationError } from '../../drivers/types/validationError';
import { Resolutions } from '../types/video';

export const createVideoInputValidation = (
  data: CreateVideoInputModel,
): ValidationError[] => {
  const errors: ValidationError[] = [];
  console.log(
    '🟡 VALIDATION - Title:',
    `"${data.title}"`,
    'Length:',
    data.title?.length,
  );

  console.log(
    '🟡 VALIDATION - Title trimmed:',
    `"${data.title?.trim()}"`,
    'Trimmed length:',
    data.title?.trim().length,
  );

  const { title, author, availableResolutions } = data;

  if (
    !title ||
    typeof title !== 'string' ||
    title.trim().length < 2 ||
    title.trim().length > 40
  ) {
    console.log('❌ TITLE VALIDATION FAILED');
    errors.push({ field: 'title', message: 'Invalid title' });
  } else {
    console.log('✅ TITLE VALIDATION PASSED');
  }

  if (
    !author ||
    typeof author !== 'string' ||
    author.trim().length < 2 ||
    author.trim().length > 20
  ) {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  if (
    !Array.isArray(availableResolutions) ||
    availableResolutions.length === 0
  ) {
    errors.push({
      field: 'availableResolutions',
      message: 'At least one resolution should be added',
    });
  } else {
    const validResolutions = Object.values(Resolutions);
    for (const resolution of availableResolutions) {
      if (!validResolutions.includes(resolution)) {
        errors.push({
          field: 'availableResolutions',
          message: 'Invalid resolution',
        });
        break;
      }
    }
  }

  return errors;
};
