// models/comment.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface IComment {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
}

const commentSchema = new Schema<IComment & Document>(
  {
    id: { type: String, required: true, unique: true },
    postId: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    commentatorInfo: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    createdAt: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);

export const CommentModel = model<IComment>('Comment', commentSchema);
