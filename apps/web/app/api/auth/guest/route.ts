import { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function POST(_req: NextRequest) {
  const upstream = await fetch(`${API_BASE}/api/auth/guest`, {
    method: "POST",
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
