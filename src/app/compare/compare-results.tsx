import Link from "next/link";
import { resolveChannel, fetchRecentVideos } from "@/lib/youtube";
import { CompareView } from "@/components/compare-view";
import { ErrorDisplay } from "@/components/error-display";
import type { ParsedChannelInput, ChannelData, VideoData } from "@/types";

interface CompareResultsProps {
  channelIdA: string;
  channelIdB: string;
}

interface ChannelResult {
  channel: ChannelData;
  videos: VideoData[];
}

async function fetchChannel(channelId: string): Promise<ChannelResult> {
  const input: ParsedChannelInput = {
    type: "channel_id",
    value: channelId,
  };
  const channel = await resolveChannel(input);
  const videos = await fetchRecentVideos(channel.uploadsPlaylistId, 90);
  return { channel, videos };
}

export async function CompareResults({
  channelIdA,
  channelIdB,
}: CompareResultsProps) {
  let resultA: ChannelResult;
  let resultB: ChannelResult;

  try {
    [resultA, resultB] = await Promise.all([
      fetchChannel(channelIdA),
      fetchChannel(channelIdB),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isQuota = message.includes("403");

    return (
      <div className="space-y-4">
        <ErrorDisplay
          error={{
            code: isQuota ? "QUOTA_EXCEEDED" : "API_ERROR",
            message: isQuota
              ? "Daily API limit reached. Try again tomorrow."
              : "Could not load one or both channels.",
            detail: message,
          }}
        />
        <div className="text-center">
          <Link href="/compare" className="text-sm text-accent hover:underline">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CompareView
      channelA={resultA.channel}
      videosA={resultA.videos}
      channelB={resultB.channel}
      videosB={resultB.videos}
    />
  );
}
