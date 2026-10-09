import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TerraVerify | Satellite Intelligence & On-Chain Carbon Verification",
  description:
    "Trust the carbon claim. Verify it from the ground — and from space. TerraVerify combines Copernicus Sentinel-2 telemetry with Solana Token-2022 transfer hooks to bring verifiable reality to carbon credits.",
  keywords: [
    "carbon credits",
    "satellite telemetry",
    "Sentinel-2",
    "Solana",
    "Token-2022",
    "climate tech",
    "environmental verification",
    "NDVI",
    "biomass monitoring"
  ],
  authors: [{ name: "TerraVerify Protocol" }],
  openGraph: {
    title: "TerraVerify | Verify the claim. See the evidence.",
    description:
      "TerraVerify uses continuous satellite intelligence and on-chain verification to bring greater trust to the carbon market.",
    siteName: "TerraVerify",
    locale: "en_US",
    type: "website",
  },
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
