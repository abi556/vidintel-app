export default function Loading() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-surface" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-surface" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Channel header skeleton */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-surface" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-surface mx-auto sm:mx-0" />
            <div className="h-4 w-28 animate-pulse rounded-lg bg-surface mx-auto sm:mx-0" />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-4 w-14 animate-pulse rounded bg-surface" />
                  <div className="h-3 w-16 animate-pulse rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-surface" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-16 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        </div>

        {/* Video grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              <div className="aspect-video animate-pulse bg-surface-hover" />
              <div className="p-3 space-y-2.5">
                <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-16 animate-pulse rounded bg-surface-hover" />
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-3 w-10 animate-pulse rounded bg-surface-hover" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
