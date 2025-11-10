import { Resolutions } from '../types/video';
import { ResourceType } from '../../core/types/resource-type';

export type UpdateVideoInputModel = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: string;
};
