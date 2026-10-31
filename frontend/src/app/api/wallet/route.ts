import { NextResponse } from "next/server";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

// Primary and fallback Solana devnet connections
const DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(DEVNET_RPC, "confirmed");

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

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

export async function GET() {
  try {
    const slot = await connection.getSlot().catch(() => 0);
    return NextResponse.json({
      status: "online",
      network: "devnet",
      rpc: DEVNET_RPC,
      currentSlot: slot,
      supportedActions: ["create", "airdrop", "balance", "transact"],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error querying cluster";
    return NextResponse.json({ status: "degraded", network: "devnet", error: msg });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      action = "create", 
      publicKey: targetPublicKey, 
      airdrop = true,
      secretKey,
      toPublicKey,
      amountSol = 0.001,
      memo,
    } = body;

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
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
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

    // Action 4: Transact (Submit an on-chain transaction with memo)
    if (action === "transact") {
      if (!secretKey || !Array.isArray(secretKey)) {
        return NextResponse.json(
          { success: false, error: "Valid secretKey array is required to sign transaction" },
          { status: 400 }
        );
      }

      if (!toPublicKey) {
        return NextResponse.json(
          { success: false, error: "toPublicKey recipient is required" },
          { status: 400 }
        );
      }

      try {
        const signerKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
        const recipientPubkey = new PublicKey(toPublicKey);
        const lamports = Math.max(1000, Math.round(Number(amountSol) * LAMPORTS_PER_SOL));

        const tx = new Transaction();

        // Add transfer instruction
        tx.add(
          SystemProgram.transfer({
            fromPubkey: signerKeypair.publicKey,
            toPubkey: recipientPubkey,
            lamports,
          })
        );

        // Add memo if provided
        if (memo && typeof memo === "string") {
          tx.add(
            new TransactionInstruction({
              keys: [{ pubkey: signerKeypair.publicKey, isSigner: true, isWritable: false }],
              programId: MEMO_PROGRAM_ID,
              data: Buffer.from(memo, "utf-8"),
            })
          );
        }

        const latestBlockhash = await connection.getLatestBlockhash();
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = signerKeypair.publicKey;
        tx.sign(signerKeypair);

        const signature = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, "confirmed");

        return NextResponse.json({
          success: true,
          signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        return NextResponse.json(
          { success: false, error: msg },
          { status: 500 }
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
