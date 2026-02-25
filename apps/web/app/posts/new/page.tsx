"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { PostSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setErr(null);
    try {
      const post = await apiPost(
        "/api/posts",
        { title, content },
        PostSchema,
      );
      r.push(`/posts/${post.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <h1>Write Post</h1>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="content"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </main>
  );
}
