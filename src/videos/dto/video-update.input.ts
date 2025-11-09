import { Resolutions } from '../types/video';
import { ResourceType } from '../../core/types/resource-type';

export type UpdateVideoInputModel = {
  data: {
    type: ResourceType.Videos;
    id: string;
    attributes: {
      title: string;
      author: string;
      availableResolutions: Resolutions[];
      canBeDownloaded: boolean | false;
      minAgeRestriction: number | null;
      createdAt: Date;
      publicationDate: Date;
    };
  };
};
