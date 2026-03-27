import Image from "next/image";
import type { ChannelData } from "@/types";
import { formatCompact } from "@/lib/formatters";

interface ChannelHeaderProps {
  channel: ChannelData;
  videoCount: number;
}

export function ChannelHeader({ channel, videoCount }: ChannelHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <Image
        src={channel.thumbnailUrl}
        alt={channel.title}
        width={80}
        height={80}
        className="rounded-full"
      />

      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-foreground">{channel.title}</h1>
        <p className="text-sm text-muted mt-0.5">{channel.customUrl}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
          <StatChip label="Subscribers" value={formatCompact(channel.subscriberCount)} />
          <StatChip label="Total views" value={formatCompact(channel.viewCount)} />
          <StatChip label="Videos" value={formatCompact(channel.videoCount)} />
          <StatChip label="Analyzed" value={String(videoCount)} highlight />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center sm:text-left">
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
