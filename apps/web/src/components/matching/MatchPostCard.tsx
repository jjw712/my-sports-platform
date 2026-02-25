import { MatchPostItem } from "@/lib/schemas";
import {
  formatDateTime,
  matchPostStatusLabel,
  timeSlotStatusLabel,
} from "@/lib/matchingDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  post: MatchPostItem;
  onClick?: () => void;
};

export default function MatchPostCard({ post, onClick }: Props) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      className={cn(
        "transition hover:border-zinc-300 dark:hover:border-zinc-600",
        onClick && "cursor-pointer",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{post.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {post.venue.name} · {post.venue.region}
          </div>
          <div className="text-sm">Host: {post.hostTeam.name}</div>
        </div>
        <Badge variant="secondary">{matchPostStatusLabel(post.status)}</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2">
          {post.slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-2 text-sm">
              <Badge
                variant={slot.status === "OPEN" ? "default" : "outline"}
                className={cn(
                  slot.status === "OPEN"
                    ? "bg-green-600 text-white dark:bg-green-500"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                {timeSlotStatusLabel(slot.status)}
              </Badge>
              <span
                className={cn(
                  slot.status === "OPEN"
                    ? "text-green-600 dark:text-green-400"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                {formatDateTime(slot.startAt)} ~ {formatDateTime(slot.endAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
