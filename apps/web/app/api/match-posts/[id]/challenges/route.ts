import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE ?? "http://localhost:4000";

function pickAuth(req: NextRequest) {
  return req.headers.get("authorization") ?? "";
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const auth = pickAuth(req);
  const body = await req.text();
  const upstream = `${API_BASE}/api/match-posts/${id}/challenges`;

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    body,
    cache: "no-store",
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
