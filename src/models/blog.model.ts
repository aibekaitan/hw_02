// models/blog.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IBlog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

const blogSchema = new Schema<IBlog & Document>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    // timestamps: true,
  },
);

export const BlogModel = model<IBlog>('Blog', blogSchema);
