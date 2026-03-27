import type { ApiError } from "@/types";

interface ErrorDisplayProps {
  error: ApiError;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div
      className="mx-auto max-w-md rounded-xl border border-border bg-surface p-8 text-center"
      role="alert"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        <ErrorIcon code={error.code} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {HEADINGS[error.code] ?? "Something went wrong"}
      </h2>
      <p className="mt-2 text-sm text-muted">{error.message}</p>
    </div>
  );
}

const HEADINGS: Record<ApiError["code"], string> = {
  CHANNEL_NOT_FOUND: "Channel not found",
  INVALID_URL: "Invalid input",
  QUOTA_EXCEEDED: "Rate limit reached",
  RATE_LIMITED: "Too many requests",
  API_ERROR: "YouTube API issue",
  NETWORK_ERROR: "Connection problem",
};

function ErrorIcon({ code }: { code: ApiError["code"] }) {
  const cls = "h-6 w-6 text-accent";

  switch (code) {
    case "CHANNEL_NOT_FOUND":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
        </svg>
      );
    case "QUOTA_EXCEEDED":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "RATE_LIMITED":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "API_ERROR":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}
