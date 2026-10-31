import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TerraVerify: AI-Satellite Carbon Credit Protocol",
    short_name: "TerraVerify",
    description: "Decentralized carbon offset protocol combining Copernicus Sentinel-2 satellite AI telemetry with Solana Token-2022 transfer hooks.",
    start_url: "/",
    display: "standalone",
    background_color: "#080c10",
    theme_color: "#06140d",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

