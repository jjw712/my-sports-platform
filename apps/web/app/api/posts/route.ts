import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE;
if (!API_BASE) throw new Error("API_BASE is not set");

function upstreamPostsUrl(req: Request) {
  const u = new URL(req.url, "http://localhost");
  const upstream = new URL("/api/posts", API_BASE);
  upstream.search = u.search;
  return upstream.toString();
}

function pickAuth(req: Request) {
  // 브라우저에서 보내는 "Authorization"은 여기서 소문자 key로 읽힘
  return req.headers.get("authorization") ?? "";
}

export async function GET(req: Request) {
  const upstream = upstreamPostsUrl(req);
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

export async function POST(req: Request) {
  const upstream = new URL("/api/posts", API_BASE).toString();
  const auth = pickAuth(req);

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    body: await req.text(),
    cache: "no-store",
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
