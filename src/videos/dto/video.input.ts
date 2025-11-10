import { Resolutions } from '../types/video';
import { ResourceType } from '../../core/types/resource-type';

export type VideoInput = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
};
