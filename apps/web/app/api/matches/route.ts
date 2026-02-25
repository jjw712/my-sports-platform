import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE;
if (!API_BASE) throw new Error("API_BASE is not set");

function upstreamMatchesUrl(req: Request) {
  const u = new URL(req.url, "http://localhost");
  const upstream = new URL("/api/matches", API_BASE);
  upstream.search = u.search;
  return upstream.toString();
}

function pickAuth(req: Request) {
  return req.headers.get("authorization") ?? "";
}

export async function GET(req: Request) {
  const upstream = upstreamMatchesUrl(req);
  const auth = pickAuth(req);

  const res = await fetch(upstream, {
    headers: {
      Accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    cache: "no-store",
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
