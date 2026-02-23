// apps/web/src/lib/user.ts
export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}
