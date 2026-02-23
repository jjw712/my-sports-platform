import { ZodType } from "zod";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const h = new Headers(extra);
  const token = getAccessToken();
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

function makeUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") return p;

  const host = process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.APP_ORIGIN;
  if (host) return new URL(p, host).toString();

  const fallback = `http://localhost:${process.env.PORT ?? "3001"}`;
  return new URL(p, fallback).toString();
}

async function parseOrThrow<T>(res: Response, schema: ZodType<T>) {
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(`API ${res.status} ${text}`);
  const json = text ? JSON.parse(text) : null;
  return schema.parse(json);
}

export async function apiGet<T>(path: string, schema: ZodType<T>): Promise<T> {
  const res = await apiFetch(path, { cache: "no-store" });
  return parseOrThrow(res, schema);
}


export async function apiPost<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
  const res = await apiFetch(makeUrl(path), {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, schema);
}

export async function apiPatch<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
  const res = await apiFetch(makeUrl(path), {
    method: "PATCH",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, schema);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await apiFetch(makeUrl(path), {
    method: "DELETE",
    headers: buildHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${text}`);
  }
}
async function refreshGuestToken(): Promise<string> {
  const r = await fetch(makeUrl("/api/auth/guest"), { method: "POST" });
  if (!r.ok) throw new Error("guest login failed");
  const data = await r.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("meKey", data.user.id);
  }
  return data.accessToken;
}

async function apiFetch(input: string, init: RequestInit = {}, retry = true) {
  const url = makeUrl(input);
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init.headers as Record<string, string> | undefined),
  });

  if (res.status !== 401 || !retry) return res;

  // 토큰이 무효/옛날이면 갈아끼우고 1회 재시도
  await refreshGuestToken();

  return fetch(url, {
    ...init,
    headers: buildHeaders(init.headers as Record<string, string> | undefined),
  });
}
