// models/post.model.ts
import { Schema, model, Document } from 'mongoose';
import { LikeStatus } from './like.model';

export interface IPost extends Document {
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
    newestLikes: Array<{
      addedAt: string;
      userId: string | null;
      login: string | null;
    }> | null;
  };
}

const postSchema = new Schema<IPost>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
    extendedLikesInfo: {
      type: {
        likesCount: { type: Number, default: 0, min: 0 },
        dislikesCount: { type: Number, default: 0, min: 0 },
        myStatus: {
          type: String,
          enum: Object.values(LikeStatus),
          default: LikeStatus.None,
          required: true,
        },
        newestLikes: {
          type: [
            {
              addedAt: { type: String, required: true },
              userId: { type: String, default: null },
              login: { type: String, default: null },
            },
          ],
          default: null,
        },
      },
      default: () => ({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: null,
      }),
    },
  },
  {
    versionKey: false,
  },
);

export const PostModel = model<IPost>('Post', postSchema);
