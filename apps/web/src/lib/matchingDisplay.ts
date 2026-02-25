type MatchPostStatus = "OPEN" | "CLOSED" | "CANCELLED";
type TimeSlotStatus = "OPEN" | "LOCKED";
type MatchStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
type ChallengeStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export function matchPostStatusLabel(status: MatchPostStatus): string {
  switch (status) {
    case "OPEN":
      return "모집중";
    case "CLOSED":
      return "모집마감";
    case "CANCELLED":
      return "취소됨";
  }
}

export function timeSlotStatusLabel(status: TimeSlotStatus): string {
  switch (status) {
    case "OPEN":
      return "선택 가능";
    case "LOCKED":
      return "확정됨";
  }
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case "SCHEDULED":
      return "경기 예정";
    case "CANCELLED":
      return "경기 취소";
    case "COMPLETED":
      return "경기 종료";
  }
}

export function challengeStatusLabel(status: ChallengeStatus): string {
  switch (status) {
    case "PENDING":
      return "대기중";
    case "ACCEPTED":
      return "수락됨";
    case "REJECTED":
      return "거절됨";
    case "WITHDRAWN":
      return "철회됨";
  }
}

const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const parts = kstFormatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return `${map.year}.${map.month}.${map.day} ${map.hour}:${map.minute}`;
}
