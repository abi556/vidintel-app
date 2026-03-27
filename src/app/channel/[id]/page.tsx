import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveChannel, fetchRecentVideos } from "@/lib/youtube";
import { ChannelHeader } from "@/components/channel-header";
import { VideoList } from "@/components/video-list";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorDisplay } from "@/components/error-display";
import { ChannelStructuredData } from "@/components/structured-data";
import { SITE_OG_IMAGE, SITE_TITLE_DEFAULT } from "@/lib/constants";
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

  let videos: import("@/types").VideoData[] = [];
  let videoError: string | undefined;
  try {
    videos = await fetchRecentVideos(channel.uploadsPlaylistId, 90);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const looksLikeMissingUploadsPlaylist =
      msg.includes("playlistId") && msg.toLowerCase().includes("cannot be found");

    if (!looksLikeMissingUploadsPlaylist) {
      console.warn("[Vidintel] Video fetch failed:", msg);
    }
    const classified = classifyError(msg);
    if (classified.code === "QUOTA_EXCEEDED") {
      return { ok: false, error: classified };
    }
    videoError = looksLikeMissingUploadsPlaylist
      ? "This channel’s uploads playlist isn’t available, so we couldn’t list recent videos."
      : msg;
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
    const title = `${channel.title} — Vidintel Analysis`;
    const description = `Video performance analysis for ${channel.title}. ${channel.videoCount} total videos, ${channel.subscriberCount.toLocaleString()} subscribers.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: channel.thumbnailUrl
          ? [{ url: channel.thumbnailUrl }]
          : [{ url: SITE_OG_IMAGE, alt: SITE_TITLE_DEFAULT }],
      },
      twitter: channel.thumbnailUrl
        ? {
            card: "summary" as const,
            title,
            description,
            images: [channel.thumbnailUrl],
          }
        : {
            card: "summary_large_image" as const,
            title,
            description,
            images: [SITE_OG_IMAGE],
          },
    };
  } catch {
    return {
      title: "Channel Analysis — Vidintel",
      openGraph: {
        images: [{ url: SITE_OG_IMAGE, alt: SITE_TITLE_DEFAULT }],
      },
      twitter: {
        card: "summary_large_image" as const,
        images: [SITE_OG_IMAGE],
      },
    };
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
        <header className="px-6 pt-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between rounded-3xl border border-border bg-background/70 px-4 py-3 backdrop-blur-md shadow-sm">
              <Link href="/">
                <Logo />
              </Link>
              <ThemeToggle />
            </div>
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
      <header className="px-6 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between rounded-3xl border border-border bg-background/70 px-4 py-3 backdrop-blur-md shadow-sm">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Compare
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <ChannelStructuredData
        channelName={data.channel.title}
        channelUrl={data.channel.customUrl}
        description={`Video performance analysis for ${data.channel.title}. ${data.videoCount} videos analyzed.`}
      />

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <ChannelHeader channel={data.channel} videos={data.videos} />

        {videoError && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground" role="alert">
            <p className="font-medium">Could not load videos</p>
            <p className="mt-1 text-xs text-muted">{videoError}</p>
          </div>
        )}

        <VideoList videos={data.videos} channel={data.channel} />

        <footer className="pt-6 pb-10 text-center text-xs text-muted-foreground">
          <div className="mx-auto mb-4 h-px w-24 bg-border/70" />
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