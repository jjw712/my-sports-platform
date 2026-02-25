import * as React from "react";
import { cn } from "@/lib/utils";

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-zinc-200 dark:bg-zinc-700", className)}
    {...props}
  />
));
Separator.displayName = "Separator";
