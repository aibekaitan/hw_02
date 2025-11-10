import { VideoOutput } from './video.output';
import { ResourceType } from '../../core/types/resource-type';
import { Resolutions } from '../types/video';

export type Video = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean | false;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: Resolutions[];
};
export type VideoListOutput = Video[];
