"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import {
  MatchPostsListResponseSchema,
  type MatchPostItem,
} from "@/lib/schemas";
import MatchPostCard from "@/components/matching/MatchPostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function MatchPostsPage() {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [includeClosed, setIncludeClosed] = useState(false);
  const [items, setItems] = useState<MatchPostItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(initial = false) {
    if (loading) return;
    setLoading(true);
    setErr(null);

    try {
      const qs = new URLSearchParams();
      if (region.trim()) qs.set("region", region.trim());
      if (includeClosed) qs.set("includeClosed", "true");
      qs.set("take", "20");
      if (!initial && nextCursor) qs.set("cursor", String(nextCursor));

      const data = await apiGet(
        `/api/match-posts?${qs.toString()}`,
        MatchPostsListResponseSchema,
      );

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

  useEffect(() => {
    setNextCursor(null);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeClosed]);

  function onSearch() {
    setNextCursor(null);
    load(true);
  }

  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Match Posts</h1>

        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-base">필터</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-48"
            />
            <Separator orientation="vertical" className="h-6" />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeClosed}
                onChange={(e) => setIncludeClosed(e.target.checked)}
              />
              마감된 경기 포함
            </label>
            <Button onClick={onSearch} disabled={loading} size="sm">
              {loading ? "Loading..." : "Search"}
            </Button>
          </CardContent>
        </Card>

        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && items.length === 0 ? (
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              현재 모집 중인 경기가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((post) => (
              <MatchPostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/match-posts/${post.id}`)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          {nextCursor !== null ? (
            <Button onClick={() => load(false)} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Load more"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No more</p>
          )}
        </div>
      </div>
    </main>
  );
}
