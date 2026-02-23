// apps/web/src/lib/reactions.ts
import { getUserId } from "@/lib/user";

export type Reaction = "LIKE" | "DISLIKE" | "NONE";

export async function sendReaction(
  postId: number,
  type: "LIKE" | "DISLIKE",
): Promise<{
  myReaction: Reaction;
  likeCount: number;
  dislikeCount: number;
}> {
  const userId = getUserId();

  const res = await fetch(`/api/posts/${postId}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, type }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
