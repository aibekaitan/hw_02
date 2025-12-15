import { ObjectId } from 'mongodb';

export type CommentInputModel = {
  content: string;
};
export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
};
export type CommentatorInfo = {
  userId: string;
  userLogin: string;
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
