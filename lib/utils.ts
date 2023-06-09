import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "./dbConnect";
import Post, { PostModelSchema } from "../models/Post";
import { CommentResponse, PostDetail, UserProfile } from "../utils/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { CommentInterface } from "../models/Comment";

interface FormidablePromise<T> {
  files: formidable.Files;
  body: T;
}

export const readFile = <T extends object>(req: NextApiRequest): Promise<FormidablePromise<T>> => {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);

      resolve({ files, body: fields as T });
    });
  });
};

export const readPostsFromDb = async (limit: number, pageNo: number, skip?: number) => {
  if (!limit || limit > 10) throw Error("Limit must be between 1 and 10")

  const finalSkip = skip || (limit * (pageNo - 1))

  await dbConnect();
  const posts = await Post.find().sort({ createdAt: 'desc' }).select('-content').skip(finalSkip).limit(limit)
  return posts
}

export const formatPosts = (posts: PostModelSchema[]): PostDetail[] => {
  const formatedPosts = posts.map((post) => {
    return {
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      createdAt: post.createdAt.toString(),
      thumbnail: post.thumbnail?.url || '',
      meta: post.meta,
      tags: post.tags
    }
  })

  return formatedPosts
}

export const isAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user as UserProfile
  return user && user.role === 'admin'
}

export const isAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user as UserProfile
  return user ? user : undefined;
}

export const formatComment = (comment: CommentInterface, user?: UserProfile): CommentResponse => {
  const { owner } = comment as any

  return {
    id: comment._id.toString(),
    content: comment.content,
    likes: comment.likes.length,
    chiefComment: comment?.chiefComment || false,
    createdAt: comment.createdAt.toString(),
    owner: { id: owner._id, name: owner.name, avatar: owner.avatar },
    repliedTo: comment?.repliedTo?.toString(),
    likedByOwner: user ? comment.likes.includes(user.id as any) : false,
  }
}