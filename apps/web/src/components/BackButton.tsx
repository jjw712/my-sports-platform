"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  fallbackHref?: string;
  className?: string;
};

export default function BackButton({ fallbackHref = "/", className }: Props) {
  const router = useRouter();

  function handleClick() {
    if (typeof window === "undefined") return;
    if (window.history.length <= 1) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn("px-2", className)}
    >
      {"<- Back"}
    </Button>
  );
}
