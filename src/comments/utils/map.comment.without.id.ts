import { WithId } from 'mongodb';
import {
  CommentDB,
  CommentInputModel,
  CommentViewModel,
} from '../types/comments.dto';

export const mapToCommentOutput = (comment: WithId<CommentDB>): CommentDB => {
  return {
    id: comment._id.toString(), // преобразуем ObjectId в строку
    content: comment.content,
    postId: comment.postId,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
  };
};

// export const mapToPostsOutput = (posts: WithId<Post>[]): Post[] => {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   return posts.map(({ _id, ...rest }) => rest);
// };
