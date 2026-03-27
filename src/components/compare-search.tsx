"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ApiError } from "@/types";

export function CompareSearch() {
  const router = useRouter();
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveChannel = async (raw: string): Promise<string> => {
    const res = await fetch("/api/channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: raw }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as ApiError).message);
    }
    return data.channelId;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const a = inputA.trim();
      const b = inputB.trim();

      if (!a || !b) {
        setError("Please enter both channel URLs to compare.");
        return;
      }

      if (a === b) {
        setError("Please enter two different channels.");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const [idA, idB] = await Promise.all([
          resolveChannel(a),
          resolveChannel(b),
        ]);
        router.push(`/compare?a=${idA}&b=${idB}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not resolve one of the channels."
        );
      } finally {
        setLoading(false);
      }
    },
    [inputA, inputB, router]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChannelInput
          label="Channel A"
          value={inputA}
          onChange={(v) => { setInputA(v); if (error) setError(null); }}
          placeholder="https://youtube.com/@mkbhd"
          disabled={loading}
        />
        <ChannelInput
          label="Channel B"
          value={inputB}
          onChange={(v) => { setInputB(v); if (error) setError(null); }}
          placeholder="https://youtube.com/@veritasium"
          disabled={loading}
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-white transition-all duration-150 hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? <LoadingSpinner /> : (
            <>
              <CompareIcon />
              Compare Channels
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-danger animate-fade-in-up text-center" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function ChannelInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-muted">
        <SearchIcon />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}
