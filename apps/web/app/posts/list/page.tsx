"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { PostsPageSchema, type Post } from "@/lib/schemas";
import { useRouter } from "next/navigation";


export default function PostsListPage() {
  const router = useRouter();
  
  const [items, setItems] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const meKey = localStorage.getItem("meKey");
    if (!token || !meKey) router.replace("/");
  }, [router]);

  async function load(initial = false) {
    setLoading(true);
    setErr(null);
    

    try {
      const qs = new URLSearchParams();
      qs.set("take", "25");
      if (!initial && nextCursor) qs.set("cursor", String(nextCursor));

      const data = await apiGet(`/api/posts?${qs.toString()}`, PostsPageSchema);

      setItems((prev) => (initial ? data.items : [...prev, ...data.items]));
      setNextCursor(data.nextCursor);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Posts List</h1>
      <div style={{ margin: "12px 0" }}>
        <Link href="/posts/new">Write</Link>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => load(false)} disabled={loading || nextCursor === null}>
          {nextCursor === null ? "No more" : loading ? "Loading..." : "Load more"}
        </button>
      </div>
    </main>
  );
}
