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
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };
}

export interface PostApi {
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
      userId: string;
      login: string;
    }>;
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
      likesCount: { type: Number, default: 0, min: 0 },
      dislikesCount: { type: Number, default: 0, min: 0 },

      newestLikes: {
        type: [
          {
            addedAt: { type: String, required: true },
            userId: { type: String, required: true },
            login: { type: String, required: true },
            _id: false,
          },
        ],
        default: [],
      },

      _id: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

export const PostModel = model<IPost>('Post', postSchema);
