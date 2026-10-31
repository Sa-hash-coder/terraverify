import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Credit Marketplace",
  description:
    "Buy and sell satellite-verified carbon offset credits settled on Solana. All tokens protected by Token-2022 Transfer Hooks with automated deforestation freeze.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Carbon Credit Marketplace | TerraVerify",
    description:
      "Decentralized orderbook for satellite-audited carbon offsets. Immediate cryptographic settlement on Solana Devnet.",
    url: "/marketplace",
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

