import { Post } from '../types/post';
import { WithId } from 'mongodb';

export const mapToPostOutput = (post: Post) => {
  // @ts-ignore
  const { _id, ...rest } = post;
  return rest;
};

export const mapToPostsOutput = (posts: WithId<Post>[]): Post[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return posts.map(({ _id, ...rest }) => rest);
};
