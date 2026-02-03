import { Blog } from '../types/blog';
import { BlogRepository } from '../repositories/blogs-repository';
import { DeleteResult, UpdateResult, WithId } from 'mongodb';
import { BlogInputModel } from '../dto/blog.input';
import { BlogPaginator } from '../types/paginator';
import { PostPaginator } from '../../posts/types/paginator';
import { BlogPostInputModel } from '../dto/blogPost.input';
import { Post } from '../../posts/types/post';
import { BlogModel } from '../../models/blog.model';
import { PostModel } from '../../models/post.model';
import { LikeStatus } from '../../models/like.model';
import { injectable } from 'inversify';
// import { blogsCollection, postsCollection } from '../../db/collections';
@injectable()
export class BlogService {
  constructor(protected blogRepository: BlogRepository) {}

  async findAllBlogs(params: {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
    searchNameTerm: string | null;
  }): Promise<BlogPaginator> {
    return this.blogRepository.findAllBlogs(params);
  }

  async findById(id: string): Promise<WithId<Blog> | null> {
    return this.blogRepository.findById(id);
  }

  async findPostsByBlogId(
    id: string,
    params: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: string;
    },
    currentUserId: string | undefined,
  ): Promise<PostPaginator> {
    return this.blogRepository.findPostsByBlogId(id, params, currentUserId);
  }

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
    await this.blogRepository.create(blog);
    return blog;
  }

  async createByBlogId(
    blogId: string,
    dto: BlogPostInputModel,
  ): Promise<Post | null> {
    return this.blogRepository.createPostByBlogId(blogId, dto);
  }

  async update(id: string, dto: BlogInputModel): Promise<UpdateResult<Blog>> {
    return this.blogRepository.update(id, dto);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.blogRepository.delete(id);
  }
}
