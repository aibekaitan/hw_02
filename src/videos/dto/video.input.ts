import { Resolutions } from '../types/video';
import { ResourceType } from '../../core/types/resource-type';

export type VideoInput = {
  type: ResourceType.Videos;
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
