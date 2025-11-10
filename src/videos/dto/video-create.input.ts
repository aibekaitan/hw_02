import { Resolutions } from '../types/video';
import { ResourceType } from '../../core/types/resource-type';

export type CreateVideoInputModel = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
};
