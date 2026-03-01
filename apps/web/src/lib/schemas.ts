import { z } from "zod";

export const RoleSchema = z.enum(["GUEST", "USER", "ADMIN"]);

export const PostSchema = z.object({
  id: z.string(),
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

export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  sido: z.string(),
  sigungu: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
 // sports: z.array(z.string()),
  facilityType: z.string().nullable().optional(),
  source: z.string().optional(),
  sourceId: z.string().nullable().optional(),
  uniqueKey: z.string().optional(),

  // NOTE: backend doesn't send this yet; derive on client
  region: z.string().optional(),
  sports: z.array(z.string()).default([])
});

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  sport: z.enum(["SOCCER", "BASKETBALL", "BASEBALL"]),
  region: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  skillRating: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(1, "팀 이름은 필수입니다.").max(100),
  sport: z.enum(["SOCCER", "BASKETBALL", "BASEBALL"]),
  region: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
  logoUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("로고 URL 형식이 올바르지 않습니다.").max(500).optional(),
  ),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
});

export const TeamCreateResponseSchema = TeamSchema.pick({
  id: true,
  name: true,
  sport: true,
  region: true,
  logoUrl: true,
  description: true,
  createdAt: true,
});

export const TimeSlotSchema = z.object({
  id: z.number(),
  matchPostId: z.number(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(["OPEN", "LOCKED"]),
  createdAt: z.string(),
});

export const MatchPostItemSchema = z.object({
  id: z.number(),
  hostTeamId: z.number(),
  venueId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  venue: VenueSchema,
  hostTeam: TeamSchema,
  slots: z.array(TimeSlotSchema),
});

export const MatchPostsListResponseSchema = z.object({
  items: z.array(MatchPostItemSchema),
  nextCursor: z.number().nullable(),
});

export const MatchChallengeSummarySchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]),
  matchPostId: z.number().optional(),
  slotId: z.number(),
  challengerTeamId: z.number(),
  createdAt: z.string(),
  challengerTeam: TeamSchema.extend({
    skillRating: z.number().optional(),
  }).optional(),
});

export const MatchPostDetailSchema = MatchPostItemSchema.extend({
  challenges: z.array(MatchChallengeSummarySchema),
});

export const MatchSchema = z.object({
  id: z.number(),
  hostTeamId: z.number(),
  awayTeamId: z.number(),
  venueId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(["SCHEDULED", "CANCELLED", "COMPLETED"]),
  matchPostId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  hostTeam: TeamSchema,
  awayTeam: TeamSchema,
  venue: VenueSchema,
  matchPost: z
    .object({
      id: z.number(),
      title: z.string(),
    })
    .optional(),
});

export const MatchesListResponseSchema = z.object({
  items: z.array(MatchSchema),
  nextCursor: z.number().nullable(),
});

export type Role = z.infer<typeof RoleSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostsListResponse = z.infer<typeof PostsListResponseSchema>;
export type PostsPage = PostsListResponse; // 별칭
export type Venue = z.infer<typeof VenueSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type TeamCreateInput = z.infer<typeof TeamCreateSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type MatchPostItem = z.infer<typeof MatchPostItemSchema>;
export type MatchPostsListResponse = z.infer<typeof MatchPostsListResponseSchema>;
export type MatchChallengeSummary = z.infer<typeof MatchChallengeSummarySchema>;
export type MatchPostDetail = z.infer<typeof MatchPostDetailSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type MatchesListResponse = z.infer<typeof MatchesListResponseSchema>;
