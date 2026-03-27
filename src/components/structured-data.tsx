import { SITE_DESCRIPTION, SITE_OG_IMAGE } from "@/lib/constants";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://vidintel-app.vercel.app";

const siteImageUrl = new URL(SITE_OG_IMAGE, `${BASE_URL}/`).href;

export function HomeStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vidintel",
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    image: siteImageUrl,
    applicationCategory: "AnalyticsApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ChannelStructuredData({
  channelName,
  channelUrl,
  description,
}: {
  channelName: string;
  channelUrl: string;
  description: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AnalysisNewsArticle",
    headline: `${channelName} — Video Performance Analysis`,
    description,
    about: {
      "@type": "Organization",
      name: channelName,
      url: `https://youtube.com/${channelUrl}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Vidintel",
      url: BASE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
