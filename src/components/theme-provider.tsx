"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "vidintel-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  const setFavicon = useCallback(() => {
    const hrefBase = "/favicon-dark.png";
    const version =
      document.documentElement.dataset.faviconVersion ?? String(Date.now());
    document.documentElement.dataset.faviconVersion = version;
    const href = `${hrefBase}?v=${encodeURIComponent(version)}`;

    const ensureLink = (rel: "icon" | "shortcut icon") => {
      let link = document.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"][data-dynamic]`
      );
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        link.type = "image/png";
        link.setAttribute("data-dynamic", "true");
      }
      link.href = href;
      // Append last so it wins precedence in browsers.
      document.head.appendChild(link);
    };

    ensureLink("icon");
    ensureLink("shortcut icon");
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    setFavicon();
  }, [setFavicon]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem(STORAGE_KEY, t);
      applyTheme(t);
    },
    [applyTheme]
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored ?? "system";
    // Hydrate theme from localStorage once on mount (client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount sync
    setThemeState(initial);
    applyTheme(initial);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem(STORAGE_KEY) ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
