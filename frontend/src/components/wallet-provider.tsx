"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletProviderComponent({ children }: { children: React.ReactNode }) {
  // Use custom RPC URL if provided, otherwise fallback to Devnet cluster
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(WalletAdapterNetwork.Devnet),
    []
  );

  // Standard wallet adapter configuration with fallback adapters
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 10000,
      }}
    >
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
