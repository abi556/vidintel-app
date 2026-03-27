import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Vidintel — YouTube Competitor Video Analysis",
    template: "%s | Vidintel",
  },
  description:
    "Paste any YouTube channel URL and instantly see which videos are performing best. Built for enterprise creators and agencies.",
  keywords: [
    "YouTube analytics",
    "competitor analysis",
    "video performance",
    "engagement rate",
    "YouTube Data API",
  ],
  authors: [{ name: "Vidintel" }],
  openGraph: {
    type: "website",
    siteName: "Vidintel",
    title: "Vidintel — YouTube Competitor Video Analysis",
    description:
      "Paste any YouTube channel URL and instantly see which videos are performing best.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidintel — YouTube Competitor Video Analysis",
    description:
      "Paste any YouTube channel URL and instantly see which videos are performing best.",
  },
  icons: {
    icon: [{ url: "/favicon-dark.png" }],
    apple: "/favicon-dark.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://vidintel-app.vercel.app"
  ),
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('vidintel-theme') || 'system';
    var d = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.classList.add(d);
    var v = String(Date.now());
    document.documentElement.dataset.faviconVersion = v;
    var href = '/favicon-dark.png?v=' + encodeURIComponent(v);
    var make = function(rel) {
      var l = document.createElement('link');
      l.rel = rel;
      l.type = 'image/png';
      l.setAttribute('data-dynamic', 'true');
      l.href = href;
      document.head.appendChild(l);
    };
    make('icon');
    make('shortcut icon');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
