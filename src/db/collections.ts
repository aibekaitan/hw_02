import { Collection } from 'mongodb';
import { Blog } from '../blogs/types/blog';
import { Post } from '../posts/types/post';

export let blogsCollection: Collection<Blog>;
export let postsCollection: Collection<Post>;

export function setBlogsCollection(collection: Collection<Blog>) {
  blogsCollection = collection;
}

export function setPostsCollection(collection: Collection<Post>) {
  postsCollection = collection;
}
