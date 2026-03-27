"use client";

import { useCallback } from "react";
import type { VideoData } from "@/types";
import { videosToCSV, downloadCSV } from "@/lib/csv-export";

interface CSVExportButtonProps {
  videos: VideoData[];
  channelName: string;
}

export function CSVExportButton({ videos, channelName }: CSVExportButtonProps) {
  const handleExport = useCallback(() => {
    const csv = videosToCSV(videos);
    const safe = channelName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    downloadCSV(csv, `vidintel_${safe}_${Date.now()}.csv`);
  }, [videos, channelName]);

  if (videos.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 h-8 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
    >
      <DownloadIcon />
      Export CSV
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
