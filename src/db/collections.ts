import { Collection } from 'mongodb';
import { Blog } from '../blogs/types/blog';
import { Post } from '../posts/types/post';
import { IUserDB } from '../users/types/user.db.interface';

export let blogsCollection: Collection<Blog>;
export let postsCollection: Collection<Post>;
export let usersCollection: Collection<IUserDB>;

export function setBlogsCollection(collection: Collection<Blog>) {
  blogsCollection = collection;
}

export function setPostsCollection(collection: Collection<Post>) {
  postsCollection = collection;
}

export function setUsersCollection(collection: Collection<IUserDB>) {
  usersCollection = collection;
}
