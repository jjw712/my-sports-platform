import { z } from "zod";

export const RoleSchema = z.enum(["GUEST", "USER", "ADMIN"]);

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),

  // 권한/소유권 체크용
  authorKey: z.string(),
  authorRole: RoleSchema,

  // 카운트 (서버가 항상 내려주면 z.number()만 써도 됨)
  likeCount: z.number().default(0),
  dislikeCount: z.number().default(0),
});

export const PostsListResponseSchema = z.object({
  items: z.array(PostSchema),
  nextCursor: z.number().nullable(),
});

// 호환용 별칭 (너 코드에서 PostsPageSchema 쓰는 곳 있으면 안 깨지게)
export const PostsPageSchema = PostsListResponseSchema;

export type Role = z.infer<typeof RoleSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostsListResponse = z.infer<typeof PostsListResponseSchema>;
export type PostsPage = PostsListResponse; // 별칭
