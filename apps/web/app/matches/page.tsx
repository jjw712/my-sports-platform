"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import {
  MatchesListResponseSchema,
  TeamSchema,
  type Match,
  type Team,
} from "@/lib/schemas";
import { formatDateTime, matchStatusLabel } from "@/lib/matchingDisplay";
import { z } from "zod";

const TeamsSchema = z.array(TeamSchema);

export default function MatchesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<string>("");
  const [items, setItems] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(teamIdValue?: string) {
    setLoading(true);
    setErr(null);

    try {
      const qs = new URLSearchParams();
      if (teamIdValue) qs.set("teamId", teamIdValue);

      const data = await apiGet(
        `/api/matches?${qs.toString()}`,
        MatchesListResponseSchema,
      );

      setItems(data.items);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const teamList = await apiGet("/api/teams", TeamsSchema);
        setTeams(teamList);
      } catch (e: any) {
        setErr(e?.message ?? "failed");
      }
      await load(undefined);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch() {
    load(teamId);
  }

  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <h1>Matches</h1>

      <section style={{ margin: "12px 0", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 14, opacity: 0.7 }}>팀 선택</span>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.region})
            </option>
          ))}
        </select>
        <button onClick={onSearch} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </section>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>등록된 경기가 없습니다.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12 }}>
          {items.map((m) => (
            <li
              key={m.id}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
              style={{
                padding: 16,
                borderRadius: 10,
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  {m.hostTeam.name} vs {m.awayTeam.name}
                </span>
                <span
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    marginLeft: 8,
                  }}
                >
                  {matchStatusLabel(m.status)}
                </span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{m.venue.name}</div>
              <div>
                {formatDateTime(m.startAt)} ~ {formatDateTime(m.endAt)}
              </div>
              {m.matchPost?.title && <div>Post: {m.matchPost.title}</div>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
