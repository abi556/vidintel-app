import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { HomeStructuredData } from "@/components/structured-data";

export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Compare
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-3xl">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              YouTube &middot; Real-time analysis
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up-delay-1">
            <span className="block">Analyze & compare</span>
            <span className="block whitespace-normal sm:whitespace-nowrap">
              YouTube channel <span className="text-accent">performance</span>
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted animate-fade-in-up-delay-2">
            Paste a channel URL to get key metrics, engagement, and trending
            signals — or compare two channels side by side.
          </p>

          <div className="w-full animate-fade-in-up-delay-3">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <SearchBar
                  className="w-full sm:flex-1 sm:max-w-none mx-0"
                  showHint={false}
                />

                <div className="flex justify-center sm:hidden">
                  <span className="text-xs text-muted-foreground">or</span>
                </div>

                <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
                  or
                </span>

                <Link
                  href="/compare"
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-accent bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover cursor-pointer shrink-0"
                >
                  Compare
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted-foreground text-center">
                Supports channel URLs, @handles, /user/ links, /c/ vanity URLs,
                and raw channel IDs
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-8 text-center animate-fade-in-up-delay-3">
            <Stat value="3" suffix="units" label="API cost per scan" />
            <Stat value="50K+" label="videos analyzed" />
            <Stat value="<2s" label="response time" />
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: string;
  suffix?: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight font-mono text-foreground whitespace-nowrap">
        {suffix ? (
          <>
            {/* Mobile: keep suffix beside number, smaller type */}
            <span className="inline-flex items-baseline gap-1 sm:hidden">
              <span>{value}</span>
              <span className="font-sans text-base font-semibold tracking-tight">
                {suffix}
              </span>
            </span>

            {/* Desktop+: keep original look (same font/size) */}
            <span className="hidden sm:inline">{`${value} ${suffix}`}</span>
          </>
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

