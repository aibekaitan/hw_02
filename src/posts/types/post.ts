import { LikeStatus } from '../../models/like.model';

export type Post = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
};
export type ExtendedLikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeDetailsViewModel[] | null;
};
export type LikeDetailsViewModel = {
  addedAt: string;
  userId: string | null;
  login: string | null;
};
