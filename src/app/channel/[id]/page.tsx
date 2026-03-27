import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveChannel, fetchRecentVideos } from "@/lib/youtube";
import { ChannelHeader } from "@/components/channel-header";
import { VideoList } from "@/components/video-list";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ParsedChannelInput, AnalysisResult } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchAnalysis(channelId: string): Promise<AnalysisResult> {
  const input: ParsedChannelInput = { type: "channel_id", value: channelId };
  const channel = await resolveChannel(input);
  const videos = await fetchRecentVideos(channel.uploadsPlaylistId, 90);

  return {
    channel,
    videos,
    fetchedAt: new Date().toISOString(),
    videoCount: videos.length,
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const input: ParsedChannelInput = { type: "channel_id", value: id };
    const channel = await resolveChannel(input);
    return {
      title: `${channel.title} — Vidintel Analysis`,
      description: `Video performance analysis for ${channel.title}. ${channel.videoCount} total videos, ${channel.subscriberCount} subscribers.`,
    };
  } catch {
    return { title: "Channel Analysis — Vidintel" };
  }
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;

  let data: AnalysisResult;
  try {
    data = await fetchAnalysis(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <ChannelHeader channel={data.channel} videoCount={data.videoCount} />

        <VideoList videos={data.videos} />

        <footer className="border-t border-border pt-6 pb-8 text-center text-xs text-muted-foreground">
          Fetched {data.videoCount} videos &middot; Last updated{" "}
          {new Date(data.fetchedAt).toLocaleTimeString()} &middot;{" "}
          <Link href="/" className="text-accent hover:underline">
            Analyze another channel
          </Link>
        </footer>
      </main>
    </div>
  );
}
