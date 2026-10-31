import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Carbon Offset Certificate",
  description:
    "Official cryptographic attestation of permanent carbon offset credit retirement on the Solana public ledger, verified by Copernicus Sentinel-2 satellites.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Verified Carbon Offset Certificate | TerraVerify",
    description:
      "Immutable on-chain proof of environmental stewardship. Inspect transaction hashes, retired tonnage, beneficiary entity, and orbital audit logs.",
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

