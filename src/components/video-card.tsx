import Image from "next/image";
import type { VideoData } from "@/types";
import { formatCompact, formatPercent, timeAgo } from "@/lib/formatters";

interface VideoCardProps {
  video: VideoData;
  velocity?: number;
}

export function VideoCard({ video, velocity }: VideoCardProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-colors hover:border-muted cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {video.isTrending && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <TrendingIcon />
            Trending
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{timeAgo(video.publishedAt)}</p>
          {velocity != null && velocity > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-accent">
              <VelocityIcon />
              {formatCompact(velocity)}/hr
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ViewIcon />
            {formatCompact(video.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <LikeIcon />
            {formatCompact(video.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <CommentIcon />
            {formatCompact(video.commentCount)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
          <span className="text-xs text-muted-foreground">Engagement</span>
          <span className="text-xs font-semibold text-foreground">
            {formatPercent(video.engagementRate)}
          </span>
        </div>
      </div>
    </a>
  );
}

function TrendingIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function VelocityIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
