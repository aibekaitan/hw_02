import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../models/like.model';

export type CommentInputModel = {
  content: string;
};
// export type CommentViewModel = {
//   id: string;
//   content: string;
//   commentatorInfo: CommentatorInfo;
//   createdAt: string;
// };
export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}
export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
export type CommentDB = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
};
export type CommentatorInfo = {
  userId: string;
  userLogin: string | undefined;
};
export type LoginSuccessViewModel = {
  accessToken: string;
};
export type MeViewModel = {
  email: string;
  login: string;
  userId: string;
};
// export type CommentDbModel = {
//   _id: ObjectId;
//   content: string;
//   commentatorInfo: {
//     userId: string;
//     userLogin: string;
//   };
//   createdAt: string;
// };
