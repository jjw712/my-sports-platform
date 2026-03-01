import { apiGet } from "@/lib/api";
import { TeamSchema } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await apiGet(`/api/teams/${id}`, TeamSchema);

  return (
    <main className="bg-gray-50 dark:bg-zinc-900" style={{ padding: 24, minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>팀 ID: {team.id}</p>
            <p>종목: {team.sport}</p>
            <p>지역: {team.region ?? "-"}</p>
            <p>설명: {team.description ?? "-"}</p>
            {team.logoUrl ? (
              <a
                className="text-blue-600 underline"
                href={team.logoUrl}
                target="_blank"
                rel="noreferrer"
              >
                로고 링크
              </a>
            ) : (
              <p>로고: -</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
