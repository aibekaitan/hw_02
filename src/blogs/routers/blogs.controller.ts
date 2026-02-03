import { Request, Response } from 'express';
import { BlogInputModel } from '../dto/blog.input';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { BlogService } from '../domain/blogs-service';
import { mapToBlogOutput } from '../mappers/map-blog-to-output';
import { BlogPaginator } from '../types/paginator';
import { injectable } from 'inversify';
@injectable()
export class BlogController {
  constructor(protected blogService: BlogService) {}
  async getAllBlogs(req: Request, res: Response<BlogPaginator>) {
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    // const blogs = await blogsCollection.find({}).toArray();
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection =
      (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
    const searchNameTerm = (req.query.searchNameTerm as string) || null;

    const result = await this.blogService.findAllBlogs({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    });
    res.status(HttpStatus.Ok).send(result);
  }
  async getPostsByBlogId(req: Request, res: Response) {
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortDirection =
      (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
    const currentUserId = req.user?.id;
    const result = await this.blogService.findPostsByBlogId(
      req.params.blogId,
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      currentUserId,
    );
    if (result.items.length === 0) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: 'blogId', message: 'blogId not found' },
          ]),
        );
      return;
    }
    res.status(HttpStatus.Ok).send(result);
  }
  async getBlogById(req: Request, res: Response) {
    const blog = await this.blogService.findById(req.params.id);
    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'blog not found' }]),
        );
      return null;
    }

    res.status(HttpStatus.Ok).send(mapToBlogOutput(blog));
  }
  async createBlog(req: Request<{}, {}, BlogInputModel>, res: Response) {
    // debugger;
    const newblog = await this.blogService.create(req.body);
    // await blogsCollection.insertOne(newblog);
    res.status(HttpStatus.Created).send(mapToBlogOutput(newblog));
  }
  async createPostByBlogId(req: Request, res: Response) {
    // debugger;
    // const blog = (req as any).blog;

    const newPost = await this.blogService.createByBlogId(
      req.params.blogId,
      req.body,
    );
    if (!newPost) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: 'blogId', message: 'blogId not found' },
          ]),
        );
      return;
    }
    // await blogsCollection.insertOne(newblog);
    res.status(HttpStatus.Created).send(newPost);
  }
  async updateBlogById(
    req: Request<{ id: string }, {}, BlogInputModel>,
    res: Response,
  ) {
    const id = req.params.id;
    const blog = await this.blogService.findById(req.params.id);
    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'blog not found' }]),
        );
      return null;
    }
    await this.blogService.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  }
  async deleteBlog(req: Request<{ id: string }>, res: Response) {
    const result = await this.blogService.delete(req.params.id);
    // const index = db.blogs.findIndex((v) => v.id === id);

    if (result.deletedCount === 0) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'blog not found' }]),
        );
      return;
    }
    res.sendStatus(HttpStatus.NoContent);
  }
}
