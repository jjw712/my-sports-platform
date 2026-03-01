import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE;

function pickAuth(req: NextRequest) {
  return req.headers.get("authorization") ?? "";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!API_BASE) {
    return NextResponse.json({ message: "API_BASE is not set" }, { status: 500 });
  }

  const { id } = await ctx.params;
  const auth = pickAuth(req);
  const upstream = `${API_BASE}/api/teams/${id}`;

  const res = await fetch(upstream, {
    headers: {
      Accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    cache: "no-store",
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
