import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "red" | "slate";

const tones: Record<Tone, string> = {
  blue: "border-blue-400/40 bg-blue-500/12 text-blue-200",
  green: "border-green-400/40 bg-green-500/12 text-green-200",
  amber: "border-amber-400/40 bg-amber-500/12 text-amber-200",
  red: "border-red-400/40 bg-red-500/12 text-red-200",
  slate: "border-slate-600 bg-slate-800/70 text-slate-300",
};

export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
