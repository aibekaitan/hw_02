import { Post } from '../types/post';
import { postsCollection } from '../../db/collections';
import { DeleteResult, UpdateResult, WithId } from 'mongodb';
import { PostInputModel } from '../dto/post.input';

export const postsRepository = {
  async findAll(): Promise<WithId<Post>[]> {
    return postsCollection.find({}).toArray();
  },
  async findById(id: string): Promise<WithId<Post> | null> {
    return postsCollection.findOne({ id });
  },
  async create(dto: PostInputModel, blogName: string): Promise<Post> {
    const createdAt = new Date();
    const post: Post = {
      id: new Date().toISOString(),
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
      createdAt: createdAt.toISOString(),
    };
    await postsCollection.insertOne(post);
    return post;
  },
  async update(id: string, dto: PostInputModel): Promise<UpdateResult<Post>> {
    return postsCollection.updateOne(
      { id },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
        },
      },
    );
  },
  async delete(id: string): Promise<DeleteResult> {
    return postsCollection.deleteOne({ id });
  },
};
