const COMPACT_THRESHOLDS: [number, string, number][] = [
  [1_000_000_000, "B", 1_000_000_000],
  [1_000_000, "M", 1_000_000],
  [1_000, "K", 1_000],
];

export function formatCompact(n: number): string {
  for (const [threshold, suffix, divisor] of COMPACT_THRESHOLDS) {
    if (n >= threshold) {
      const value = n / divisor;
      return value % 1 === 0
        ? `${value}${suffix}`
        : `${value.toFixed(1)}${suffix}`;
    }
  }
  return String(n);
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
