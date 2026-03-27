import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompareSearch } from "@/components/compare-search";
import { CompareResults } from "./compare-results";

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export const metadata = {
  title: "Compare Channels",
  description: "Compare two YouTube channels side by side — subscribers, views, engagement, upload cadence, and more.",
};

export default async function ComparePage({ searchParams }: PageProps) {
  const { a, b } = await searchParams;
  const hasChannels = a && b;

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
                href="/"
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Analyze
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {!hasChannels ? (
          <div className="flex flex-col items-center gap-8 pt-12">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                Compare YouTube Channels
              </h1>
              <p className="text-muted max-w-lg mx-auto">
                Paste two channel URLs to see a head-to-head breakdown of
                subscribers, views, engagement, upload cadence, and more.
              </p>
            </div>
            <CompareSearch />
          </div>
        ) : (
          <>
            <CompareSearch />
            <Suspense fallback={<CompareLoadingSkeleton />}>
              <CompareResults channelIdA={a} channelIdB={b} />
            </Suspense>
          </>
        )}
      </main>
    </div>
  );
}

function CompareLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="h-32 rounded-xl bg-surface" />
        <div className="w-8" />
        <div className="h-32 rounded-xl bg-surface" />
      </div>
      <div className="h-12 rounded-xl bg-surface" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-surface" />
      ))}
    </div>
  );
}
