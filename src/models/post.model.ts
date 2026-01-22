// models/post.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IPost {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

const postSchema = new Schema<IPost & Document>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);

export const PostModel = model<IPost>('Post', postSchema);
