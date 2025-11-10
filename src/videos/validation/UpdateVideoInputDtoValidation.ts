import { VideoInput } from '../dto/video.input';
import { Resolutions } from '../types/video';
import { ValidationError } from '../../drivers/types/validationError';
import { CreateVideoInputModel } from '../dto/video-create.input';
import { UpdateVideoInputModel } from '../dto/video-update.input';

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const updateVideoInputValidation = (
  data: UpdateVideoInputModel,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const {
    title,
    author,
    canBeDownloaded,
    minAgeRestriction,
    publicationDate,
    availableResolutions,
  } = data;

  // Title validation
  if (
    !title ||
    typeof title !== 'string' ||
    title.trim().length < 2 ||
    title.trim().length > 40
  ) {
    errors.push({ field: 'title', message: 'Invalid title' });
  }

  // Author validation
  if (
    !author ||
    typeof author !== 'string' ||
    author.trim().length < 2 ||
    author.trim().length > 20
  ) {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  // canBeDownloaded validation
  if (typeof canBeDownloaded !== 'boolean') {
    errors.push({
      field: 'canBeDownloaded',
      message: 'Invalid canBeDownloaded',
    });
  }

  // minAgeRestriction validation
  if (
    minAgeRestriction !== null &&
    (typeof minAgeRestriction !== 'number' ||
      minAgeRestriction > 18 ||
      minAgeRestriction < 1)
  ) {
    errors.push({
      field: 'minAgeRestriction',
      message: 'Invalid AgeRestriction',
    });
  }

  // publicationDate validation
  if (
    typeof publicationDate !== 'string' ||
    isNaN(new Date(publicationDate).getTime())
  ) {
    errors.push({
      field: 'publicationDate',
      message: 'publicationDate must be a valid date-time string',
    });
  }

  // availableResolutions validation
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
