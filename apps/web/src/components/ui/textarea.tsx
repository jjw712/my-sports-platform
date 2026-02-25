import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300",
        "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-600",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
