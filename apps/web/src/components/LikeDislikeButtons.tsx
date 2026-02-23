"use client";

import { useState } from "react";
import { sendReaction, type Reaction } from "@/lib/like";


type Props = { postId: number; initialLike: number; initialDislike: number; };


export default function LikeDislikeButtons({
  postId,
  initialLike,
  initialDislike,
}: Props) {
  const [reaction, setReaction] = useState<Reaction>("NONE");
  const [like, setLike] = useState(initialLike);
  const [dislike, setDislike] = useState(initialDislike);

  const onReact = async (type: "LIKE" | "DISLIKE") => {
    const result = await sendReaction(postId, type);
    setReaction(result.myReaction);
    setLike(result.likeCount);
    setDislike(result.dislikeCount);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => onReact("LIKE")} style={{ fontWeight: reaction === "LIKE" ? 700 : 400 }}>
        👍 {like}
      </button>
      <button onClick={() => onReact("DISLIKE")} style={{ fontWeight: reaction === "DISLIKE" ? 700 : 400 }}>
        👎 {dislike}
      </button>
    </div>
  );
}
