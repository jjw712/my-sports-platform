import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300",
        "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-600",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
