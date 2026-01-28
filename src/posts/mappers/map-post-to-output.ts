// mappers/map-post-to-output.ts
import { Post, PostDB } from '../types/post'; // твои интерфейсы
import { LikeStatus } from '../../models/like.model';

export const mapToPostOutput = (
  dbPost: PostDB,
  currentUserId?: string,
): Post => {
  let myStatus = LikeStatus.None;

  const newestLikes = dbPost.extendedLikesInfo?.newestLikes || [];
  const reversedLikes = [...newestLikes].reverse();

  return {
    id: dbPost.id,
    title: dbPost.title,
    shortDescription: dbPost.shortDescription,
    content: dbPost.content,
    blogId: dbPost.blogId,
    blogName: dbPost.blogName,
    createdAt: dbPost.createdAt,
    extendedLikesInfo: {
      likesCount: dbPost.extendedLikesInfo.likesCount,
      dislikesCount: dbPost.extendedLikesInfo.dislikesCount,
      myStatus,
      newestLikes: reversedLikes,
    },
  };
};

export const mapToPostsOutput = (
  dbPosts: PostDB[],
  currentUserId?: string,
): Post[] => {
  return dbPosts.map((post) => mapToPostOutput(post, currentUserId));
};
