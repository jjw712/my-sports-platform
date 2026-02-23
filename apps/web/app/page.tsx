"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function guestLogin() {
  const r = await fetch("/api/auth/guest", { method: "POST" });
  if (!r.ok) throw new Error("guest login failed");
  const data = await r.json();

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("meKey", data.user.id);
}

export default function Home() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onGuest() {
    setLoading(true);
    setErr(null);
    try {
      await guestLogin();
      router.push("/posts/list"); // ✅ 게스트 로그인 후 Posts로 이동
    } catch (e: any) {
      setErr(e?.message ?? "guest login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onLogin() {
    // TODO: 일반 로그인 API 연결
    setErr("일반 로그인 아직 미구현");
  }

  async function onAdminLogin() {
    // TODO: 관리자 로그인 API 연결
    setErr("관리자 로그인 아직 미구현");
  }

  async function onSignup() {
    // TODO: 회원가입 라우트로 이동
    router.push("/signup");
  }

  return (
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Login</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ padding: 12, borderRadius: 8 }}
        />
        <input
          placeholder="password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 12, borderRadius: 8 }}
        />

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button onClick={onLogin} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
          로그인
        </button>

        <button onClick={onAdminLogin} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
          관리자 로그인
        </button>

        <button onClick={onGuest} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
          게스트 로그인
        </button>

        <button onClick={onSignup} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
          회원가입
        </button>
      </div>
    </main>
  );
}
