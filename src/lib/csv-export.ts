import type { VideoData } from "@/types";

const HEADERS = [
  "Title",
  "Video ID",
  "Published",
  "Views",
  "Likes",
  "Comments",
  "Engagement Rate",
  "Trending",
  "URL",
] as const;

function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function videosToCSV(videos: VideoData[], channelName: string): string {
  const rows = videos.map((v) =>
    [
      escapeField(v.title),
      v.id,
      new Date(v.publishedAt).toISOString().split("T")[0],
      String(v.viewCount),
      String(v.likeCount),
      String(v.commentCount),
      (v.engagementRate * 100).toFixed(2) + "%",
      v.isTrending ? "Yes" : "No",
      `https://www.youtube.com/watch?v=${v.id}`,
    ].join(",")
  );

  return [HEADERS.join(","), ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
