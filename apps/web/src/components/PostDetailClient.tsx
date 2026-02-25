"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/schemas";

type Me = { id: string; role: string };

function parseMeFromToken(): Me | null {
  // 니 프로젝트에서 토큰/유저 저장 방식에 맞게 바꿔라.
  // 예시: localStorage에 accessToken 저장했다고 가정
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) return null;

  // JWT 디코딩을 깔끔하게 하려면 라이브러리 쓰는게 낫지만,
  // 최소 구현으로 payload만 base64url 디코딩(검증 X)
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return { id: json.sub, role: json.role };
  } catch {
    return null;
  }
}

export default function PostDetailClient({ initialPost }: { initialPost: Post }) {
  const router = useRouter();

  const [post, setPost] = useState<Post>(initialPost);
  const [isEdit, setEdit] = useState(false);
  const [title, setTitle] = useState(initialPost.title);
  const [content, setContent] = useState(initialPost.content);

  const me = useMemo(() => parseMeFromToken(), []);
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const canEdit = !!me && post.authorKey === me.id;

  function showErr(status: number, msg?: string) {
    if (status === 401) alert("로그인이 필요합니다");
    else if (status === 403) alert("본인 글만 수정/삭제 가능");
    else if (status === 400) alert("제목/내용 중 최소 하나는 있어야 함");
    else alert(msg ?? "알 수 없는 오류");
  }

  async function onSave() {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          title: title === post.title ? undefined : title,
          content: content === post.content ? undefined : content,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showErr(res.status, data?.message);
        return;
      }

      setPost(data);
      setEdit(false);
      // 최신화 필요하면:
      // router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "network error");
    }
  }

  async function onDelete() {
    if (!confirm("삭제할까?")) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showErr(res.status, data?.message);
        return;
      }

      // 삭제 후 목록으로
      router.push("/posts/list");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "network error");
    }
  }

  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      {!isEdit ? (
        <>
          <h1>{post.title}</h1>
          <p style={{ opacity: 0.7 }}>{String(post.createdAt)}</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{post.content}</pre>

          {canEdit && (
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={() => setEdit(true)}>Edit</button>
              <button onClick={onDelete}>Delete</button>
            </div>
          )}
        </>
      ) : (
        <>
          <h1>Edit</h1>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={onSave}>Save</button>
            <button onClick={() => setEdit(false)}>Cancel</button>
          </div>

          {!canEdit && (
            <p style={{ color: "crimson", marginTop: 12 }}>
              본인 글 아니면 저장 안 된다.
            </p>
          )}
        </>
      )}
    </main>
  );
}
