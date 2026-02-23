"use client";

import { useEffect,useState } from "react";

async function ensureGuestToken() {
  const token = localStorage.getItem("accessToken");
  const meKey = localStorage.getItem("meKey");

  if (token && meKey && !isJwtExpired(token)) {
    return token;
  }

  const r = await fetch("/api/auth/guest", { method: "POST" });
  if (!r.ok) throw new Error("guest login failed");
  const data = await r.json();

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("meKey", data.user.id);
  return data.accessToken;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function isJwtExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
