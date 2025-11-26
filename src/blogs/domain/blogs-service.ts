import { Blog } from '../types/blog';
import { blogsRepository } from '../repositories/blogs-repository';
import { DeleteResult, UpdateResult, WithId } from 'mongodb';
import { BlogInputModel } from '../dto/blog.input';
import { BlogPaginator } from '../types/paginator';
import { PostPaginator } from '../../posts/types/paginator';

export const blogsService = {
  async findAllBlogs(params: {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
    searchNameTerm: string | null;
  }): Promise<BlogPaginator> {
    return blogsRepository.findAllBlogs(params);
  },
  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsRepository.findById(id);
  },
  async findPostsByBlogId(
    id: string,
    params: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: string;
    },
  ): Promise<PostPaginator> {
    return blogsRepository.findPostsByBlogId(id, params);
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
    await blogsRepository.create(blog);
    return blog;
  },
  async update(id: string, dto: BlogInputModel): Promise<UpdateResult<Blog>> {
    return blogsRepository.update(id, dto);
  },
  async delete(id: string): Promise<DeleteResult> {
    return blogsRepository.delete(id);
  },
};
