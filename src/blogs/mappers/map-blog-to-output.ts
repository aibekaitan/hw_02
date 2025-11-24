import { Blog } from '../types/blog';
import { WithId } from 'mongodb';
//
export const mapToBlogOutput = (blog: Blog): Blog => {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: false,
  };
};
export const mapToBlogsOutput = (blogs: WithId<Blog>[]): Blog[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return blogs.map(({ _id, ...rest }) => rest);
};
