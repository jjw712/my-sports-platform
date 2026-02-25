"use client";

import Link from "next/link";
import { useTheme } from "./providers";
import BackButton from "@/components/BackButton";

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      style={{
        padding: "12px 24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <BackButton />
      <Link href="/">Home</Link>
      <Link href="/posts/list">Posts</Link>
      <Link href="/match-posts">Match Posts</Link>
      <Link href="/match-posts/new">매치글 작성</Link>
      <Link href="/matches">Matches</Link>
      <div style={{ marginLeft: "auto" }}>
        <button
          onClick={toggleTheme}
          className="rounded px-3 py-1 bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white"
          type="button"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
