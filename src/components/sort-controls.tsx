"use client";

import type { SortKey, SortDirection } from "@/types";

interface SortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortKeyChange: (key: SortKey) => void;
  onSortDirectionToggle: () => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "date", label: "Date" },
  { key: "engagement", label: "Engagement" },
];

export function SortControls({
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionToggle,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs text-muted-foreground sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={onSortDirectionToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
        aria-label={`Sort ${sortDirection === "desc" ? "descending" : "ascending"}. Click to toggle.`}
      >
        {sortDirection === "desc" ? <ArrowDownIcon /> : <ArrowUpIcon />}
      </button>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
