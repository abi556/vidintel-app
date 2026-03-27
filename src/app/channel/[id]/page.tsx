import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveChannel, fetchRecentVideos } from "@/lib/youtube";
import { ChannelHeader } from "@/components/channel-header";
import { VideoList } from "@/components/video-list";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorDisplay } from "@/components/error-display";
import type { ParsedChannelInput, AnalysisResult, ApiError } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

type FetchResult =
  | { ok: true; data: AnalysisResult; videoError?: string }
  | { ok: false; error: ApiError };

function classifyError(msg: string): ApiError {
  if (msg.toLowerCase().includes("not found")) {
    return { code: "CHANNEL_NOT_FOUND", message: msg };
  }
  if (msg.includes("403")) {
    return {
      code: "QUOTA_EXCEEDED",
      message: "Daily API limit reached. Try again tomorrow.",
      detail: msg,
    };
  }
  return {
    code: "API_ERROR",
    message: "YouTube API is having issues. Try again shortly.",
    detail: msg,
  };
}

async function fetchAnalysis(channelId: string): Promise<FetchResult> {
  let channel;
  try {
    const input: ParsedChannelInput = { type: "channel_id", value: channelId };
    channel = await resolveChannel(input);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Vidintel] Channel resolution failed:", msg);
    return { ok: false, error: classifyError(msg) };
  }

  let videos;
  let videoError: string | undefined;
  try {
    videos = await fetchRecentVideos(channel.uploadsPlaylistId, 90);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Vidintel] Video fetch failed:", msg);
    const classified = classifyError(msg);
    if (classified.code === "QUOTA_EXCEEDED") {
      return { ok: false, error: classified };
    }
    videoError = msg;
    videos = [];
  }

  return {
    ok: true,
    data: {
      channel,
      videos,
      fetchedAt: new Date().toISOString(),
      videoCount: videos.length,
    },
    videoError,
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
  const result = await fetchAnalysis(id);

  if (!result.ok) {
    if (result.error.code === "CHANNEL_NOT_FOUND") {
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

        <main className="mx-auto max-w-6xl px-6 py-24">
          <ErrorDisplay error={result.error} />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-accent hover:underline"
            >
              Try another channel
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { data, videoError } = result;

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

        {videoError && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground" role="alert">
            <p className="font-medium">Could not load videos</p>
            <p className="mt-1 text-xs text-muted">{videoError}</p>
          </div>
        )}

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
