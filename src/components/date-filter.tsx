"use client";

import type { DateRange } from "@/types";

interface DateFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "60d", label: "60 days" },
  { value: "90d", label: "90 days" },
];

export function DateFilter({ selected, onChange }: DateFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1"
      role="radiogroup"
      aria-label="Date range filter"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={selected === opt.value}
          className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors cursor-pointer ${
            selected === opt.value
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
