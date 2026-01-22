import { Schema, model, Document } from 'mongoose';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export interface ILike extends Document {
  createdAt: Date;
  status: LikeStatus;
  authorId: string;
  parentId: string;
  parentType: 'Comment';
}

const likeSchema = new Schema<ILike>(
  {
    createdAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: Object.values(LikeStatus),
      required: true,
    },
    authorId: { type: String, required: true },
    parentId: { type: String, required: true },
    parentType: { type: String, default: 'Comment' },
  },
  {
    versionKey: false,
  },
);

likeSchema.index({ authorId: 1, parentId: 1, parentType: 1 }, { unique: true });

export const LikeModel = model<ILike>('Like', likeSchema);
