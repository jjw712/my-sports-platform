"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import {
  TeamSchema,
  VenueSchema,
  type Team,
  type Venue,
} from "@/lib/schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const TeamsSchema = z.array(TeamSchema);
const VenuesSchema = z.array(VenueSchema);
const CreateResponseSchema = z.object({ id: z.number() });

type SlotInput = { startAt: string; endAt: string };

type SlotError = { index: number; message: string };

type OverlapWarning = { a: number; b: number };

export default function NewMatchPostPage() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [region, setRegion] = useState("");
  const [hostTeamId, setHostTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState<SlotInput[]>([
    { startAt: "", endAt: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slotErrors, setSlotErrors] = useState<SlotError[]>([]);

  const overlapWarnings = useMemo(() => {
    const ranges = slots
      .map((s, index) => {
        if (!s.startAt || !s.endAt) return null;
        const start = new Date(s.startAt).getTime();
        const end = new Date(s.endAt).getTime();
        if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
        return { index, start, end };
      })
      .filter((v): v is { index: number; start: number; end: number } => v !== null);

    const overlaps: OverlapWarning[] = [];
    for (let i = 0; i < ranges.length; i += 1) {
      for (let j = i + 1; j < ranges.length; j += 1) {
        const a = ranges[i];
        const b = ranges[j];
        if (a.start < b.end && a.end > b.start) {
          overlaps.push({ a: a.index, b: b.index });
        }
      }
    }

    return overlaps;
  }, [slots]);

  useEffect(() => {
    async function loadTeams() {
      setTeamsLoading(true);
      try {
        const qs = new URLSearchParams();
        if (region.trim()) qs.set("region", region.trim());
        const list = await apiGet(`/api/venues?${qs.toString()}`, VenuesSchema);
const withRegion = list.map((v) => ({
  ...v,
  region: v.region ?? `${v.sido}${v.sigungu ? " " + v.sigungu : ""}`,
}));
setVenues(withRegion);
      } catch (e: any) {
        setErr(e?.message ?? "failed to load teams");
      } finally {
        setTeamsLoading(false);
      }
    }

    async function loadVenues() {
      setVenuesLoading(true);
      try {
        const qs = new URLSearchParams();
        if (region.trim()) qs.set("region", region.trim());
        const list = await apiGet(`/api/venues?${qs.toString()}`, VenuesSchema);
        setVenues(list);
      } catch (e: any) {
        setErr(e?.message ?? "failed to load venues");
      } finally {
        setVenuesLoading(false);
      }
    }

    setErr(null);
    loadTeams();
    loadVenues();
  }, [region]);

  useEffect(() => {
    if (!venueId) return;
    const exists = venues.some((v) => String(v.id) === venueId);
    if (!exists) setVenueId("");
  }, [venues, venueId]);

  function updateSlot(index: number, patch: Partial<SlotInput>) {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function addSlot() {
    setSlots((prev) => [...prev, { startAt: "", endAt: "" }]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function validateSlots(): boolean {
    const errors: SlotError[] = [];

    slots.forEach((s, index) => {
      if (!s.startAt || !s.endAt) {
        errors.push({ index, message: "시작/종료 시간을 모두 입력하세요." });
        return;
      }

      const start = new Date(s.startAt).getTime();
      const end = new Date(s.endAt).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        errors.push({ index, message: "유효한 시간을 입력하세요." });
        return;
      }

      if (start >= end) {
        errors.push({ index, message: "시작 시간이 종료 시간보다 빨라야 합니다." });
      }
    });

    setSlotErrors(errors);
    return errors.length === 0;
  }

  async function submit() {
    setErr(null);
    setSlotErrors([]);

    if (!hostTeamId || !venueId) {
      setErr("팀과 구장을 선택하세요.");
      return;
    }
    if (!title.trim()) {
      setErr("제목을 입력하세요.");
      return;
    }

    if (!validateSlots()) return;

    const slotPayload = slots.map((s) => ({
      startAt: new Date(s.startAt).toISOString(),
      endAt: new Date(s.endAt).toISOString(),
    }));

    setLoading(true);
    try {
      const created = await apiPost(
        "/api/match-posts",
        {
          hostTeamId: Number(hostTeamId),
          venueId: Number(venueId),
          title: title.trim(),
          description: description.trim(),
          slots: slotPayload,
        },
        CreateResponseSchema,
      );
      router.push(`/match-posts/${created.id}`);
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">매치글 작성</h1>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <span className="text-sm">Region</span>
              <Input
                placeholder="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <span className="text-sm">Host Team</span>
              <Select
                value={hostTeamId}
                onChange={(e) => setHostTeamId(e.target.value)}
                disabled={teamsLoading}
              >
                <SelectItem value="">팀 선택</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.region})
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Separator />

            <div className="grid gap-2">
              <span className="text-sm">Venue</span>
              <Select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                disabled={venuesLoading || venues.length === 0}
              >
                <SelectItem value="">구장 선택</SelectItem>
                {venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} - {v.address}
                  </SelectItem>
                ))}
              </Select>
              {venuesLoading && <p className="text-sm">구장 불러오는 중…</p>}
              {!venuesLoading && venues.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  등록된 구장이 없습니다.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <span className="text-sm">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <span className="text-sm">Description</span>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Slots</CardTitle>
            <Button variant="outline" size="sm" onClick={addSlot}>
              슬롯 추가
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {slots.map((s, idx) => {
              const error = slotErrors.find((e) => e.index === idx);
              return (
                <div key={idx} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">Slot {idx + 1}</strong>
                    {slots.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSlot(idx)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    value={s.startAt}
                    onChange={(e) =>
                      updateSlot(idx, { startAt: e.target.value })
                    }
                  />
                  <Input
                    type="datetime-local"
                    value={s.endAt}
                    onChange={(e) => updateSlot(idx, { endAt: e.target.value })}
                  />
                  {error && (
                    <p className="text-xs text-red-600">{error.message}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {overlapWarnings.length > 0 && (
          <p className="text-sm text-amber-600">
            슬롯 시간이 겹칩니다. 확인해주세요.
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={submit} disabled={loading || !venueId}>
            {loading ? "Saving..." : "생성"}
          </Button>
        </div>
      </div>
    </main>
  );
}
