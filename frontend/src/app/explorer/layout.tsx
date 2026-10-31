import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Satellite Forest Explorer",
  description:
    "Explore near real-time Copernicus Sentinel-2 satellite telemetry, NDVI vegetative health indexes, and on-chain project oracles across verified ecological parcels.",
  alternates: {
    canonical: "/explorer",
  },
  openGraph: {
    title: "Satellite Forest Explorer | TerraVerify",
    description:
      "Monitor living forest canopies with 10m multispectral satellite imagery, automated NDVI calculations, and Solana on-chain oracle verification.",
    url: "/explorer",
  },
};

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

