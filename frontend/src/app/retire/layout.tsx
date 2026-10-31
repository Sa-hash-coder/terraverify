import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retire Carbon Credits & Emissions Calculator",
  description:
    "Permanently burn verified carbon credits on Solana to claim legitimate offsets. Built-in Scope 1-3 corporate emissions calculator and immutable retirement certificates.",
  alternates: {
    canonical: "/retire",
  },
  openGraph: {
    title: "Retire Carbon Credits | TerraVerify",
    description:
      "Execute permanent on-chain token burns to the Solana incinerator. Generate cryptographic retirement certificates with dynamic verification QR codes.",
    url: "/retire",
  },
};

export default function RetireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

