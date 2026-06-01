"use client";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
};

export function TabsNav({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="scrollbar-soft flex gap-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "h-9 shrink-0 rounded-md px-3 text-sm font-semibold text-slate-400 transition",
            active === tab.value && "bg-primary text-white shadow-glow",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
