import { z } from 'zod';

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  likeCount: z.number(),
  dislikeCount: z.number(),
});

export const PostsListResponseSchema = z.object({
  items: z.array(PostSchema),
  nextCursor: z.number().nullable(),
});

export type Post = z.infer<typeof PostSchema>;
export type PostsListResponse = z.infer<typeof PostsListResponseSchema>;

