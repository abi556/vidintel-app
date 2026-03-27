import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ChannelData, VideoData, ChannelInsights } from "@/types";
import { formatCompact } from "./formatters";

const ACCENT: [number, number, number] = [255, 0, 0];
const DARK: [number, number, number] = [15, 15, 15];
const MUTED: [number, number, number] = [96, 96, 96];

export function generatePDF(
  channel: ChannelData,
  videos: VideoData[],
  insights: ChannelInsights | null
): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFontSize(20);
  doc.setTextColor(...ACCENT);
  doc.text("VIDINTEL", 14, y);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("YouTube Competitor Video Analysis", 48, y);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, pageWidth - 14, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  y += 10;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(channel.title, 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(channel.customUrl, 14, y);

  y += 8;
  const summaryStats = [
    ["Subscribers", formatCompact(channel.subscriberCount)],
    ["Total Views", formatCompact(channel.viewCount)],
    ["Videos Analyzed", String(videos.length)],
    ["Trending", String(videos.filter((v) => v.isTrending).length)],
  ];

  doc.setFontSize(8);
  let sx = 14;
  for (const [label, value] of summaryStats) {
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value, sx, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, sx, y + 4);
    sx += 45;
  }

  y += 14;

  if (insights) {
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text("Key Insights", 14, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    const insightRows = [
      [
        "Top by Views",
        truncate(insights.topPerformers.byViews.title, 40),
        formatCompact(insights.topPerformers.byViews.viewCount) + " views",
      ],
      [
        "Top by Engagement",
        truncate(insights.topPerformers.byEngagement.title, 40),
        (insights.topPerformers.byEngagement.engagementRate * 100).toFixed(1) + "%",
      ],
      [
        "Top by Comments",
        truncate(insights.topPerformers.byComments.title, 40),
        formatCompact(insights.topPerformers.byComments.commentCount) + " comments",
      ],
      [
        "Upload Cadence",
        `Every ${insights.uploadFrequency.avgDaysBetweenUploads} days`,
        `${Math.round(insights.uploadFrequency.consistencyScore * 100)}% consistent`,
      ],
      [
        "Best Posting Day",
        insights.bestPostingTime.bestDay.name,
        formatCompact(insights.bestPostingTime.bestDay.avgViews) + " avg views",
      ],
      [
        "Best Posting Hour",
        insights.bestPostingTime.bestHour.name + " UTC",
        formatCompact(insights.bestPostingTime.bestHour.avgViews) + " avg views",
      ],
      [
        "Fastest Growing",
        truncate(insights.fastestGrowing.title, 40),
        formatCompact(insights.fastestGrowing.velocity) + " views/hr",
      ],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Category", "Detail", "Value"]],
      body: insightRows,
      theme: "plain",
      styles: { fontSize: 8, cellPadding: 2, textColor: DARK },
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: DARK,
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 90 },
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Video Performance", 14, y);
  doc.setFont("helvetica", "normal");
  y += 4;

  const tableBody = videos.map((v) => [
    truncate(v.title, 45),
    new Date(v.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    formatCompact(v.viewCount),
    formatCompact(v.likeCount),
    formatCompact(v.commentCount),
    (v.engagementRate * 100).toFixed(2) + "%",
    v.isTrending ? "Yes" : "",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Title", "Published", "Views", "Likes", "Comments", "Engagement", "Trending"]],
    body: tableBody,
    theme: "striped",
    styles: { fontSize: 7, cellPadding: 1.5, textColor: DARK },
    headStyles: {
      fillColor: [...ACCENT],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      6: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.text("Generated by Vidintel — vidintel-app.vercel.app", 14, footerY);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, footerY, { align: "right" });
  }

  return doc;
}

export function downloadPDF(
  channel: ChannelData,
  videos: VideoData[],
  insights: ChannelInsights | null
): void {
  const doc = generatePDF(channel, videos, insights);
  const safe = channel.title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  doc.save(`vidintel_${safe}_${Date.now()}.pdf`);
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "\u2026" : str;
}
