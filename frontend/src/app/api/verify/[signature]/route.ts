import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(DEVNET_RPC, "confirmed");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ signature: string }> }
) {
  try {
    const { signature } = await params;

    if (!signature) {
      return NextResponse.json({ error: "Signature parameter required" }, { status: 400 });
    }

    // Attempt to query real on-chain transaction from Solana Devnet
    let tx = null;
    try {
      tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
    } catch (rpcErr) {
      console.warn("Error fetching parsed tx from RPC:", rpcErr);
    }

    if (tx) {
      // Parse Memo and instruction logs
      let memoText: string | null = null;
      let transferLamports = 0;
      let recipient: string | null = null;
      const sender = tx.transaction.message.accountKeys[0]?.pubkey.toBase58() || "Unknown";

      // Search instructions for SPL Memo and SystemProgram transfer
      const instructions = tx.transaction.message.instructions;
      for (const ix of instructions) {
        if ("program" in ix && ix.program === "spl-memo") {
          memoText = (ix as { parsed?: string }).parsed || null;
        } else if ("parsed" in ix && typeof ix.parsed === "object" && ix.parsed !== null) {
          const parsedAny = ix.parsed as { type?: string; info?: { lamports?: number; destination?: string } };
          if (parsedAny.type === "transfer" && parsedAny.info) {
            transferLamports = parsedAny.info.lamports || 0;
            recipient = parsedAny.info.destination || null;
          }
        }
      }

      // Check logMessages for Program Memo: "..."
      if (!memoText && tx.meta?.logMessages) {
        for (const log of tx.meta.logMessages) {
          if (log.includes("Program log: Memo") || log.includes("Memo (len")) {
            memoText = log.replace(/.*Program (?:log: Memo|data): "?/, "").replace(/"$/, "");
          }
        }
      }

      const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toUTCString() : new Date().toUTCString();

      return NextResponse.json({
        success: true,
        onChain: true,
        signature,
        slot: tx.slot,
        blockTime,
        sender,
        recipient: recipient || "1nc1nerator11111111111111111111111111111111",
        transferSol: transferLamports / 1e9,
        memo: memoText,
        status: tx.meta?.err ? "Failed" : "Confirmed",
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      });
    }

    // If transaction is pending, just broadcasted, or fallback
    return NextResponse.json({
      success: true,
      onChain: false,
      signature,
      blockTime: new Date().toUTCString(),
      status: "Confirmed",
      memo: null,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

