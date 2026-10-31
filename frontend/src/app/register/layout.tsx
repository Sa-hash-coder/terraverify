import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Forest Parcel & Land Title",
  description:
    "Enroll ecological conservation parcels, upload cadastral deed documents, and trigger autonomous ESA Copernicus Sentinel-2 baseline satellite audits on Solana.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register Forest Parcel | TerraVerify",
    description:
      "Join the decentralized ecological registry. Onboard land parcel boundaries for continuous multispectral verification and on-chain credit issuance.",
    url: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

