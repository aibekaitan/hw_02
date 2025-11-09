import { VideoInput } from '../dto/video.input';
import { Resolutions } from '../types/video';
import { ValidationError } from '../../drivers/types/validationError';
import { CreateVideoInputModel } from '../dto/video-create.input';

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const videoInputDtoValidation = (
  data: VideoInput,
): ValidationError[] => {
  const errors: ValidationError[] = [];
  console.log('validation data: ', data);
  const {
    title,
    author,
    canBeDownloaded,
    minAgeRestriction,
    createdAt,
    publicationDate,
    availableResolutions,
  } = data.attributes;
  if (
    !title ||
    typeof title !== 'string' ||
    title.trim().length < 2 ||
    title.trim().length > 15
  ) {
    errors.push({ field: 'name', message: 'Invalid name' });
  }

  if (!author || typeof author !== 'string') {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  if (typeof canBeDownloaded !== 'boolean') {
    errors.push({
      field: 'canBeDownloaded',
      message: 'Invalid canBeDownloaded',
    });
  }

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

  if (isNaN(new Date(createdAt).getTime())) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt' });
  }

  if (
    typeof publicationDate !== 'string' ||
    isNaN(new Date(publicationDate).getTime())
  ) {
    errors.push({
      field: 'publicationDate',
      message: 'publicationDate must be a valid date-time string',
    });
  }

  if (!Array.isArray(availableResolutions)) {
    errors.push({
      field: 'availableResolutions',
      message: 'availableResolutions must be array',
    });
  } else if (availableResolutions.length) {
    const existingFeatures = Object.values(Resolutions);
    if (
      availableResolutions.length > existingFeatures.length ||
      availableResolutions.length < 1
    ) {
      errors.push({
        field: 'availableResolutions',
        message: 'Invalid availableResolutions',
      });
    }
    for (const feature of availableResolutions) {
      if (!existingFeatures.includes(feature)) {
        errors.push({
          field: 'Resolutions',
          message: 'Invalid availableResolutions:' + feature,
        });
        break;
      }
    }
  }

  return errors;
};
