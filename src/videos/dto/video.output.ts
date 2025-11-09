import { ResourceType } from '../../core/types/resource-type';
import { Resolutions } from '../types/video';

export type VideoOutput = {
  type: ResourceType.Videos;
  id: number;
  attributes: {
    title: string;
    author: string;
    canBeDownloaded: boolean | false;
    minAgeRestriction: number | null;
    createdAt: Date;
    publicationDate: Date;
    availableResolutions: Resolutions[];
  };
};
