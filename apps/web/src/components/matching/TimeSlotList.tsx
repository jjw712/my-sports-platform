import { TimeSlot } from "@/lib/schemas";
import { formatDateTime, timeSlotStatusLabel } from "@/lib/matchingDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  slots: TimeSlot[];
  selectedSlotId?: number;
  onSelectSlot?: (slotId: number) => void;
};

export default function TimeSlotList({
  slots,
  selectedSlotId,
  onSelectSlot,
}: Props) {
  return (
    <div className="grid gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const isOpen = slot.status === "OPEN";
        return (
          <button
            key={slot.id}
            type="button"
            onClick={isOpen ? () => onSelectSlot?.(slot.id) : undefined}
            disabled={!isOpen}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm",
              "border-zinc-200 dark:border-zinc-700",
              isOpen
                ? "hover:border-zinc-300 dark:hover:border-zinc-600"
                : "opacity-60 cursor-not-allowed",
              isSelected && "ring-2 ring-zinc-300 dark:ring-zinc-600",
            )}
          >
            <div className="flex flex-col">
              <span
                className={cn(
                  isOpen
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {formatDateTime(slot.startAt)} ~ {formatDateTime(slot.endAt)}
              </span>
            </div>
            <Badge variant={isOpen ? "default" : "outline"}>
              {timeSlotStatusLabel(slot.status)}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
