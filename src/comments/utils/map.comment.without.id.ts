import { WithId } from 'mongodb';
import { CommentDB, CommentInputModel } from '../types/comments.dto';

export const mapToCommentOutput = (comment: CommentDB) => {
  // @ts-ignore
  const { _id, ...rest } = comment;
  return rest;
};

// export const mapToPostsOutput = (posts: WithId<Post>[]): Post[] => {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   return posts.map(({ _id, ...rest }) => rest);
// };
