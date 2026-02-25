"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import {
  MatchPostDetailSchema,
  TeamSchema,
  type MatchPostDetail,
  type Team,
} from "@/lib/schemas";
import {
  challengeStatusLabel,
  formatDateTime,
  matchPostStatusLabel,
} from "@/lib/matchingDisplay";
import { z } from "zod";
import TimeSlotList from "@/components/matching/TimeSlotList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const TeamsSchema = z.array(TeamSchema);
const UnknownSchema = z.unknown();

export default function MatchPostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;
  const router = useRouter();

  const [post, setPost] = useState<MatchPostDetail | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [slotId, setSlotId] = useState<string>("");
  const [challengerTeamId, setChallengerTeamId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const openSlots = useMemo(() => {
    return post?.slots.filter((s) => s.status === "OPEN") ?? [];
  }, [post]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiGet(
        `/api/match-posts/${postId}`,
        MatchPostDetailSchema,
      );
      setPost(data);

      const teamList = await apiGet("/api/teams", TeamsSchema);
      setTeams(teamList);

      if (!slotId && data.slots.length > 0) {
        const open = data.slots.find((s) => s.status === "OPEN");
        if (open) setSlotId(String(open.id));
      }
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function onCreateChallenge() {
    if (!slotId || !challengerTeamId) {
      toast("슬롯과 팀을 선택해주세요.");
      return;
    }

    setActionLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      await apiPost(
        `/api/match-posts/${postId}/challenges`,
        {
          slotId: Number(slotId),
          challengerTeamId: Number(challengerTeamId),
          message: message.trim() ? message.trim() : undefined,
        },
        UnknownSchema,
      );
      setMessage("");
      setSuccess("도전이 등록되었습니다.");
      await load();
    } catch (e: any) {
      handleApiError(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function onAccept(challengeId: number) {
    setActionLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      await apiPost(`/api/challenges/${challengeId}/accept`, {}, UnknownSchema);
      setSuccess("도전이 수락되었습니다.");
      router.refresh();
      await load();
    } catch (e: any) {
      handleApiError(e);
    } finally {
      setActionLoading(false);
    }
  }

  function handleApiError(error: unknown) {
    setErr(null);
    const message = error instanceof Error ? error.message : String(error ?? "");
    const match = /^API\\s+(\\d+)/.exec(message);
    const status = match ? Number(match[1]) : null;

    switch (status) {
      case 400:
        toast("입력값을 확인해주세요.");
        return;
      case 401:
        toast("로그인이 필요합니다.");
        return;
      case 403:
        toast("권한이 없습니다.");
        return;
      case 404:
        toast("대상을 찾을 수 없습니다.");
        return;
      case 409:
        toast("해당 시간대에 이미 경기가 있습니다");
        return;
      default:
        toast("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  if (loading && !post) {
    return (
      <main
        className="bg-gray-50 dark:bg-zinc-900"
        style={{ padding: 24, minHeight: "100vh" }}
      >
        <h1>Match Post</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main
        className="bg-gray-50 dark:bg-zinc-900"
        style={{ padding: 24, minHeight: "100vh" }}
      >
        <h1>Match Post</h1>
        {err ? <p style={{ color: "crimson" }}>{err}</p> : <p>Not found</p>}
      </main>
    );
  }

  const isClosed = post.status === "CLOSED";

  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <Badge variant="secondary">
                {matchPostStatusLabel(post.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{post.description}</p>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <div>
              Venue: {post.venue.name} ({post.venue.region})
            </div>
            <div>Address: {post.venue.address}</div>
            <div>Host: {post.hostTeam.name}</div>
          </CardContent>
        </Card>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-base">Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSlotList
              slots={post.slots}
              selectedSlotId={slotId ? Number(slotId) : undefined}
              onSelectSlot={(id) => setSlotId(String(id))}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="text-base">Challenges</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {post.challenges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  등록된 도전이 없습니다.
                </p>
              ) : (
                post.challenges.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-700"
                  >
                    <div className="space-y-1">
                      <div>
                        {challengeStatusLabel(c.status)} · slot {c.slotId}
                      </div>
                      <div className="text-muted-foreground">
                        {c.challengerTeam?.name ?? c.challengerTeamId}
                      </div>
                    </div>
                    {c.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => onAccept(c.id)}
                        disabled={actionLoading}
                      >
                        Accept
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="text-base">Create Challenge</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                disabled={isClosed}
              >
                <SelectItem value="">Select slot</SelectItem>
                {openSlots.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {formatDateTime(s.startAt)} ~ {formatDateTime(s.endAt)}
                  </SelectItem>
                ))}
              </Select>

              <Select
                value={challengerTeamId}
                onChange={(e) => setChallengerTeamId(e.target.value)}
                disabled={isClosed}
              >
                <SelectItem value="">Select team</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.region})
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                placeholder="message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                disabled={isClosed}
              />

              <Button
                onClick={onCreateChallenge}
                disabled={actionLoading || !slotId || isClosed}
              >
                {actionLoading ? "Submitting..." : "도전하기"}
              </Button>
              {isClosed && (
                <p className="text-xs text-muted-foreground">
                  모집이 마감된 글입니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
