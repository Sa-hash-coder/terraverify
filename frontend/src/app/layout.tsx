import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import WalletProviderComponent from "../components/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://terraverify-gold.vercel.app";

export const viewport: Viewport = {
  themeColor: "#06140d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "TerraVerify | Satellite AI Carbon Offset Protocol on Solana",
    template: "%s | TerraVerify",
  },
  description:
    "Don't Trust. Verify from Space. TerraVerify connects ESA Copernicus Sentinel-2 satellite AI telemetry with Solana Token-2022 transfer hooks to automate ecological verification and credit revocation.",
  keywords: [
    "TerraVerify",
    "Carbon Credits",
    "Solana",
    "Token-2022",
    "Satellite Telemetry",
    "Copernicus Sentinel-2",
    "NDVI Index",
    "Transfer Hooks",
    "Automated Revocation",
    "Web3 Climate",
    "Climate Tech",
    "Carbon Accounting",
    "Decentralized MRV",
    "Biomass Monitoring",
    "Corporate LCA",
  ],
  authors: [{ name: "TerraVerify Protocol", url: APP_URL }],
  creator: "TerraVerify Protocol",
  publisher: "TerraVerify Foundation",
  applicationName: "TerraVerify",
  category: "Climate Technology & Decentralized Finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TerraVerify | AI-Satellite Carbon Credit Protocol on Solana",
    description:
      "Continuous ESA Copernicus Sentinel-2 satellite AI audits combined with Solana Token-2022 Transfer Hooks for real-time carbon credit verification and auto-revocation.",
    url: APP_URL,
    siteName: "TerraVerify Protocol",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/satellite_hero.jpg",
        width: 1200,
        height: 630,
        alt: "TerraVerify Satellite Telemetry Protocol Interface",
      },
      {
        url: "/dashboard.png",
        width: 1200,
        height: 630,
        alt: "TerraVerify Real-Time Environmental Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerraVerify | Verify from Space",
    description:
      "Automated carbon credit verification and revocation using Sentinel-2 satellite AI and Solana Token-2022 transfer hooks.",
    images: ["/satellite_hero.jpg"],
    creator: "@terraverify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "TerraVerify Protocol",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.png`,
      },
      description:
        "Decentralized ecological verification protocol bridging Earth observation satellites with Solana smart contracts.",
      sameAs: [
        "https://github.com/terraverify",
        "https://twitter.com/terraverify",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: "TerraVerify",
      description: "AI-Satellite Carbon Offset Verification on Solana",
      publisher: {
        "@id": `${APP_URL}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#webapp`,
      name: "TerraVerify Platform",
      url: APP_URL,
      applicationCategory: "BusinessApplication, ClimateTechApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript and HTML5 support",
      description:
        "Real-time satellite MRV platform for auditing forest canopy index, purchasing verified offsets, and managing automated smart contract revocations.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Sentinel-2 L2A Multispectral NDVI computation",
        "Solana Token-2022 Transfer Hook Enforcement",
        "Automated Deforestation Smart Contract Revocation",
        "Corporate Scope 1-3 Emissions Calculator",
        "On-Chain Ledger Retirement Attestations with QR Proofs",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var stored = localStorage.getItem('terra_theme');
                var theme = stored ? stored : 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--text)]">
        <WalletProviderComponent>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </WalletProviderComponent>
      </body>
    </html>
  );
}
