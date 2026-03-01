import { NextResponse } from "next/server";
import { TeamCreateSchema } from "@/lib/schemas";

function getApiBase() {
  return process.env.API_BASE;
}

function upstreamTeamsUrl(req: Request) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error("API_BASE is not set");
  const u = new URL(req.url, "http://localhost");
  const upstream = new URL("/api/teams", apiBase);
  upstream.search = u.search;
  return upstream.toString();
}

function pickAuth(req: Request) {
  return req.headers.get("authorization") ?? "";
}

function proxyResponse(res: Response) {
  return new NextResponse(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET(req: Request) {
  try {
    const upstream = upstreamTeamsUrl(req);
    const auth = pickAuth(req);

    const res = await fetch(upstream, {
      headers: {
        Accept: "application/json",
        ...(auth ? { authorization: auth } : {}),
      },
      cache: "no-store",
    });

    return proxyResponse(res);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "failed to proxy teams list" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const apiBase = getApiBase();
  if (!apiBase) {
    return NextResponse.json({ message: "API_BASE is not set" }, { status: 500 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid JSON body" }, { status: 400 });
  }

  const parsed = TeamCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "invalid request body" },
      { status: 400 },
    );
  }

  const auth = pickAuth(req);
  const upstream = new URL("/api/teams", apiBase).toString();

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  return proxyResponse(res);
}
