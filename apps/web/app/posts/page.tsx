import Link from "next/link";

export default function PostsHome() {
  return (
    <main
      className="bg-gray-50 dark:bg-zinc-900"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <h1>Posts</h1>
      <div style={{ marginTop: 12 }}>
        <Link href="/posts/list">Go to list</Link>
        {" | "}
        <Link href="/posts/new">Write</Link>
      </div>
    </main>
  );
}
