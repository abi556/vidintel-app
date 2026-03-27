"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { VideoData, ChannelData, ChannelInsights } from "@/types";
import { videosToCSV, downloadCSV } from "@/lib/csv-export";
import { videosToJSON, downloadJSON } from "@/lib/json-export";
import { downloadPDF } from "@/lib/pdf-export";
import { computeInsights } from "@/lib/analytics";

interface ExportDropdownProps {
  videos: VideoData[];
  channel: ChannelData;
}

export function ExportDropdown({ videos, channel }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const insights = useMemo<ChannelInsights | null>(() => {
    if (videos.length === 0) return null;
    return computeInsights(videos);
  }, [videos]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const safeName = channel.title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const ts = Date.now();

  const handleCSV = useCallback(() => {
    const csv = videosToCSV(videos, channel.title);
    downloadCSV(csv, `vidintel_${safeName}_${ts}.csv`);
    setOpen(false);
  }, [videos, channel.title, safeName, ts]);

  const handleJSON = useCallback(() => {
    const json = videosToJSON(channel, videos, insights);
    downloadJSON(json, `vidintel_${safeName}_${ts}.json`);
    setOpen(false);
  }, [videos, channel, insights, safeName, ts]);

  const handlePDF = useCallback(() => {
    downloadPDF(channel, videos, insights);
    setOpen(false);
  }, [videos, channel, insights]);

  if (videos.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 h-8 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <DownloadIcon />
        Export
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-background shadow-lg overflow-hidden animate-fade-in-up">
          <ExportOption
            icon={<CSVIcon />}
            label="CSV"
            description="Spreadsheet data"
            onClick={handleCSV}
          />
          <ExportOption
            icon={<JSONIcon />}
            label="JSON"
            description="Structured data"
            onClick={handleJSON}
          />
          <ExportOption
            icon={<PDFIcon />}
            label="PDF Report"
            description="Branded report"
            onClick={handlePDF}
          />
        </div>
      )}
    </div>
  );
}

function ExportOption({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface transition-colors cursor-pointer"
    >
      <span className="shrink-0 text-muted">{icon}</span>
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CSVIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" x2="16" y1="13" y2="13" />
      <line x1="8" x2="16" y1="17" y2="17" />
    </svg>
  );
}

function JSONIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" />
      <path d="M8 17h2" />
      <path d="M14 13h2" />
      <path d="M14 17h2" />
    </svg>
  );
}

function PDFIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15v-2h1.5a1.5 1.5 0 0 1 0 3H9" />
    </svg>
  );
}
