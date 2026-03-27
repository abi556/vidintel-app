"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApiError } from "@/types";

const PLACEHOLDER_EXAMPLES = [
  "https://youtube.com/@mkbhd",
  "@veritasium",
  "https://youtube.com/c/LinusTechTips",
];

const DEFAULT_PLACEHOLDER = "https://youtube.com/@mkbhd";

export function SearchBar() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);

  useEffect(() => {
    const idx = Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length);
    setPlaceholder(PLACEHOLDER_EXAMPLES[idx]);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();

      if (!trimmed) {
        setError("Paste a YouTube channel URL, handle, or ID.");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/channel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: trimmed }),
        });

        const data = await res.json();

        if (!res.ok) {
          const apiError = data as ApiError;
          setError(apiError.message);
          return;
        }

        router.push(`/channel/${data.channelId}`);
      } catch {
        setError("Something went wrong. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [input, router]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition-colors focus-within:border-muted">
        <SearchIcon />

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          placeholder={`Try ${placeholder}`}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          aria-label="YouTube channel URL or handle"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-all duration-150 hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {loading ? <LoadingSpinner /> : "Analyze"}
        </button>
      </div>

      {error && (
        <p
          className="mt-3 text-sm text-danger animate-fade-in-up text-center"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Supports channel URLs, @handles, /user/ links, /c/ vanity URLs, and
        raw channel IDs
      </p>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground shrink-0"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}
