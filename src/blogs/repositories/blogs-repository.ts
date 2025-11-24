import { Blog } from '../types/blog';
import { blogsCollection } from '../../db/collections';
import { DeleteResult, UpdateResult, WithId } from 'mongodb';
import { BlogInputModel } from '../dto/blog.input';

export const blogsRepository = {
  async findAllBlogs(): Promise<WithId<Blog>[]> {
    return blogsCollection.find({}).toArray();
  },
  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ id: id });
  },
  async create(dto: BlogInputModel): Promise<Blog> {
    const createdAt = new Date();
    const blog: Blog = {
      id: new Date().toISOString(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: createdAt.toISOString(),
      isMembership: false,
    };
    await blogsCollection.insertOne(blog);
    return blog;
  },
  async update(id: string, dto: BlogInputModel): Promise<UpdateResult<Blog>> {
    return blogsCollection.updateOne(
      { id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
  },
  async delete(id: string): Promise<DeleteResult> {
    return blogsCollection.deleteOne({ id: id });
  },
};
