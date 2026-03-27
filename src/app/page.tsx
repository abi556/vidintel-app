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
              YouTube Data API v3 &middot; Real-time analysis
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up-delay-1">
            See which competitor videos are{" "}
            <span className="text-accent">crushing it</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted animate-fade-in-up-delay-2">
            Paste any YouTube channel URL and instantly get performance
            metrics, engagement rates, and trending indicators for every
            video published this month.
          </p>

          <div className="w-full animate-fade-in-up-delay-3">
            <SearchBar />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-8 text-center animate-fade-in-up-delay-3">
            <Stat value="3 units" label="API cost per scan" />
            <Stat value="50+" label="videos analyzed" />
            <Stat value="<2s" label="response time" />
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight font-mono text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

