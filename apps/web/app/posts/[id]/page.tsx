import { notFound } from "next/navigation";
import { PostSchema } from "@/lib/schemas";
import PostDetailClient from "@/components/PostDetailClient";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const API_BASE = process.env.API_BASE || "http://localhost:4000";
  const res = await fetch(`${API_BASE}/api/posts/${id}`, { cache: "no-store" });

  if (res.status === 404) {
    notFound(); // ✅ 404면 정상적으로 404 페이지로
  }
  if (!res.ok) {
    throw new Error(`Failed to load post: ${res.status} ${await res.text().catch(() => "")}`);
  }

  const data = await res.json();
  const post = PostSchema.parse(data);
  return <PostDetailClient initialPost={post} />;
}
