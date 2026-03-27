import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center bg-[#0f0f0f] text-[#f1f1f1] p-6">
      <div className="w-full max-w-[460px] rounded-2xl border border-[#3e3e3e] bg-[#1b1b1b] p-6">
        <h1 className="text-2xl font-semibold mb-2.5">You&apos;re offline</h1>
        <p className="text-[#b0b0b0] leading-relaxed mb-3.5">
          Vidintel couldn&apos;t reach the network. Reconnect and refresh to
          continue analyzing channels.
        </p>
        <Link
          href="/"
          className="text-[#3ea6ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ea6ff]"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
