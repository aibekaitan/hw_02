import { LikeStatus } from '../../models/like.model';
import { Types } from 'mongoose';

export interface PostDB {
  _id: Types.ObjectId;
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus?: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
  __v?: number;
}

export interface Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
}
