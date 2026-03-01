"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { TeamCreateResponseSchema, TeamCreateSchema } from "@/lib/schemas";

type Sport = "SOCCER" | "BASKETBALL" | "BASEBALL";

export default function NewTeamPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sport, setSport] = useState<Sport>("SOCCER");
  const [region, setRegion] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      sport,
      region: region.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    const parsed = TeamCreateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인하세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const text = await res.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        setError(data?.message ?? text ?? `등록 실패 (${res.status})`);
        return;
      }

      const created = TeamCreateResponseSchema.parse(data);
      router.push(`/teams/${created.id}`);
    } catch (e: any) {
      setError(e?.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-gray-50 dark:bg-zinc-900" style={{ padding: 24, minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle>팀 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <span className="text-sm">팀 이름 *</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: Seoul Strikers"
                  required
                />
              </div>

              <div className="grid gap-2">
                <span className="text-sm">종목 *</span>
                <Select value={sport} onChange={(e) => setSport(e.target.value as Sport)}>
                  <SelectItem value="SOCCER">축구</SelectItem>
                  <SelectItem value="BASKETBALL">농구</SelectItem>
                  <SelectItem value="BASEBALL">야구</SelectItem>
                </Select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm">지역</span>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <span className="text-sm">로고 URL</span>
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-2">
                <span className="text-sm">설명</span>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading}>
                {loading ? "등록 중..." : "등록"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
