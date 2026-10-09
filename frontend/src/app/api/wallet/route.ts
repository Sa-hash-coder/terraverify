import { NextResponse } from "next/server";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

// Solana devnet connection
const DEVNET_RPC = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const connection = new Connection(DEVNET_RPC, "confirmed");

// Helper to encode uint8array to base58 without requiring direct dependency
function toBase58(buffer: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits: number[] = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; ++j) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
  return digits.reverse().map((d) => ALPHABET[d]).join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = "create", publicKey: targetPublicKey, airdrop = true } = body;

    // Action 1: Create a brand new Solana Keypair / Wallet
    if (action === "create") {
      const keypair = Keypair.generate();
      const pubKey = keypair.publicKey.toBase58();
      const secretKeyArray = Array.from(keypair.secretKey);
      const secretKeyBase58 = toBase58(keypair.secretKey);

      let initialBalance = 0;
      let airdropSignature: string | null = null;
      let airdropMessage = "Wallet generated successfully.";

      // Try funding with Devnet SOL if requested
      if (airdrop) {
        try {
          const sig = await connection.requestAirdrop(
            keypair.publicKey,
            1 * LAMPORTS_PER_SOL
          );
          const latestBlockhash = await connection.getLatestBlockhash();
          await connection.confirmTransaction({
            signature: sig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          }, "confirmed");

          airdropSignature = sig;
          initialBalance = 1.0;
          airdropMessage = "Funded with 1.0 Devnet SOL.";
        } catch (airdropErr: unknown) {
          const errStr = airdropErr instanceof Error ? airdropErr.message : String(airdropErr);
          console.warn("Devnet airdrop faucet rate limit or delay:", errStr);
          airdropMessage = "Devnet airdrop rate limited. You can request SOL via faucet anytime.";
        }
      }

      return NextResponse.json({
        success: true,
        wallet: {
          publicKey: pubKey,
          secretKey: secretKeyArray,
          secretKeyBase58,
          balance: initialBalance,
          airdropSignature,
          airdropMessage,
          network: "devnet",
          explorerUrl: `https://explorer.solana.com/address/${pubKey}?cluster=devnet`,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Action 2: Request Airdrop on existing address
    if (action === "airdrop") {
      if (!targetPublicKey) {
        return NextResponse.json(
          { success: false, error: "publicKey is required for airdrop" },
          { status: 400 }
        );
      }

      let pubKeyObj: PublicKey;
      try {
        pubKeyObj = new PublicKey(targetPublicKey);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid Solana public key format" },
          { status: 400 }
        );
      }

      try {
        const signature = await connection.requestAirdrop(
          pubKeyObj,
          1 * LAMPORTS_PER_SOL
        );
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, "confirmed");

        const balanceLamports = await connection.getBalance(pubKeyObj);
        return NextResponse.json({
          success: true,
          signature,
          balance: balanceLamports / LAMPORTS_PER_SOL,
          message: "1.0 SOL airdropped on Devnet successfully.",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Airdrop failed";
        return NextResponse.json(
          {
            success: false,
            error: msg.includes("429")
              ? "Devnet Faucet is rate-limited. Please retry in 1 minute."
              : msg,
          },
          { status: 429 }
        );
      }
    }

    // Action 3: Check Balance
    if (action === "balance") {
      if (!targetPublicKey) {
        return NextResponse.json(
          { success: false, error: "publicKey is required" },
          { status: 400 }
        );
      }

      try {
        const pubKeyObj = new PublicKey(targetPublicKey);
        const balanceLamports = await connection.getBalance(pubKeyObj);
        return NextResponse.json({
          success: true,
          balance: balanceLamports / LAMPORTS_PER_SOL,
        });
      } catch (err: unknown) {
        return NextResponse.json(
          { success: false, error: "Failed to retrieve balance" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action '${action}'` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
