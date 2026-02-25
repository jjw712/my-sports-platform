import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline";
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  secondary:
    "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",
  outline: "border border-zinc-200 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
