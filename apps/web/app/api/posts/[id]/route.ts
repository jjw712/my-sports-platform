import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE ?? "http://localhost:4000";

function pickAuth(req: NextRequest) {
  return req.headers.get("authorization") ?? "";
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // Promise로 받기
) {
  const { id } = await ctx.params;         // await로 꺼내기

  const auth = pickAuth(req);
  const body = await req.text();

  const upstream = `${API_BASE}/api/posts/${id}`;
  console.log("PATCH proxy hit:", { id, upstream });

  const res = await fetch(upstream, {
    method: "PATCH",
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

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // Promise로 받기
) {
  const { id } = await ctx.params;

  const auth = pickAuth(req);
  const upstream = `${API_BASE}/api/posts/${id}`;
  console.log("DELETE proxy hit:", { id, upstream });

  const res = await fetch(upstream, {
    method: "DELETE",
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
