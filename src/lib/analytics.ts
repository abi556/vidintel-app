import type {
  VideoData,
  VideoDataWithVelocity,
  TopPerformers,
  UploadFrequency,
  BestPostingTime,
  ChannelInsights,
} from "@/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getTopPerformers(videos: VideoData[]): TopPerformers {
  if (videos.length === 0) {
    throw new Error("Cannot compute top performers from an empty list");
  }

  return {
    byViews: videos.reduce((best, v) =>
      v.viewCount > best.viewCount ? v : best
    ),
    byEngagement: videos.reduce((best, v) =>
      v.engagementRate > best.engagementRate ? v : best
    ),
    byComments: videos.reduce((best, v) =>
      v.commentCount > best.commentCount ? v : best
    ),
  };
}

export function getUploadFrequency(videos: VideoData[]): UploadFrequency {
  if (videos.length < 2) {
    return {
      avgDaysBetweenUploads: 0,
      consistencyScore: 1,
      longestGapDays: 0,
      shortestGapDays: 0,
    };
  }

  const sorted = [...videos].sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs =
      new Date(sorted[i].publishedAt).getTime() -
      new Date(sorted[i - 1].publishedAt).getTime();
    gaps.push(diffMs / (1000 * 60 * 60 * 24));
  }

  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const variance =
    gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length;
  const stddev = Math.sqrt(variance);

  const consistency = mean > 0 ? Math.max(0, Math.min(1, 1 - stddev / mean)) : 1;

  return {
    avgDaysBetweenUploads: Math.round(mean * 10) / 10,
    consistencyScore: Math.round(consistency * 100) / 100,
    longestGapDays: Math.round(Math.max(...gaps) * 10) / 10,
    shortestGapDays: Math.round(Math.min(...gaps) * 10) / 10,
  };
}

export function getBestPostingTime(videos: VideoData[]): BestPostingTime {
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0)
  );
  const countMap: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0)
  );

  for (const v of videos) {
    const d = new Date(v.publishedAt);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    heatmap[day][hour] += v.viewCount;
    countMap[day][hour] += 1;
  }

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (countMap[d][h] > 0) {
        heatmap[d][h] = Math.round(heatmap[d][h] / countMap[d][h]);
      }
    }
  }

  const dayTotals = Array.from({ length: 7 }, () => ({
    totalViews: 0,
    count: 0,
  }));
  const hourTotals = Array.from({ length: 24 }, () => ({
    totalViews: 0,
    count: 0,
  }));

  for (const v of videos) {
    const d = new Date(v.publishedAt);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    dayTotals[day].totalViews += v.viewCount;
    dayTotals[day].count += 1;
    hourTotals[hour].totalViews += v.viewCount;
    hourTotals[hour].count += 1;
  }

  let bestDayIdx = 0;
  let bestDayAvg = 0;
  for (let i = 0; i < 7; i++) {
    const avg =
      dayTotals[i].count > 0
        ? dayTotals[i].totalViews / dayTotals[i].count
        : 0;
    if (avg > bestDayAvg) {
      bestDayAvg = avg;
      bestDayIdx = i;
    }
  }

  let bestHourIdx = 0;
  let bestHourAvg = 0;
  for (let i = 0; i < 24; i++) {
    const avg =
      hourTotals[i].count > 0
        ? hourTotals[i].totalViews / hourTotals[i].count
        : 0;
    if (avg > bestHourAvg) {
      bestHourAvg = avg;
      bestHourIdx = i;
    }
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12} ${period}`;
  };

  return {
    bestDay: {
      name: DAY_NAMES[bestDayIdx],
      avgViews: Math.round(bestDayAvg),
      videoCount: dayTotals[bestDayIdx].count,
    },
    bestHour: {
      hour: bestHourIdx,
      name: formatHour(bestHourIdx),
      avgViews: Math.round(bestHourAvg),
      videoCount: hourTotals[bestHourIdx].count,
    },
    heatmap,
  };
}

export function getViewVelocity(videos: VideoData[]): VideoDataWithVelocity[] {
  const now = Date.now();
  const MIN_HOURS = 0.5;

  return videos
    .map((v) => {
      const hoursSincePublish =
        (now - new Date(v.publishedAt).getTime()) / (1000 * 60 * 60);
      const safeHours = Math.max(hoursSincePublish, MIN_HOURS);
      return { ...v, velocity: Math.round(v.viewCount / safeHours) };
    })
    .sort((a, b) => b.velocity - a.velocity);
}

export function computeInsights(videos: VideoData[]): ChannelInsights {
  const topPerformers = getTopPerformers(videos);
  const uploadFrequency = getUploadFrequency(videos);
  const bestPostingTime = getBestPostingTime(videos);
  const velocities = getViewVelocity(videos);

  return {
    topPerformers,
    uploadFrequency,
    bestPostingTime,
    velocities,
    fastestGrowing: velocities[0],
  };
}
