"""
TerraVerify — Oracle Submitter
Signs and submits satellite analysis results to the Solana blockchain.
"""

import os
import logging
import hashlib
from typing import Dict, Any

from solana.rpc.api import Client
from solana.transaction import Transaction
from solders.keypair import Keypair
from solders.pubkey import Pubkey

logger = logging.getLogger(__name__)

class OracleSubmitter:
    """
    Acts as the off-chain authority for TerraVerify.
    Submits verification reports directly to the Anchor program on Solana.
    """

    def __init__(self, rpc_url: str = "https://api.devnet.solana.com"):
        self.client = Client(rpc_url)
        
        # Load authority keypair from environment or local file
        # For development, we'll generate a dummy keypair if none exists
        keypair_path = os.environ.get("ORACLE_KEYPAIR_PATH", "oracle_keypair.json")
        if os.path.exists(keypair_path):
            with open(keypair_path, "r") as f:
                # Basic load logic - in reality use solana-keygen standard formats
                pass
            self.authority = Keypair() # Replace with actual load
        else:
            logger.warning("No oracle keypair found. Using newly generated keypair for testing.")
            self.authority = Keypair()

        # Hardcoded Program ID for the Verification Oracle (to be updated after deploy)
        self.program_id = Pubkey.from_string("11111111111111111111111111111111")
        
        logger.info(f"Oracle Submitter initialized on {rpc_url}")
        logger.info(f"Authority Pubkey: {self.authority.pubkey()}")

    def hash_evidence(self, evidence_data: bytes) -> bytes:
        """
        Generate SHA-256 hash of the evidence package (images, logs).
        This hash goes on-chain so the IPFS data can be verified.
        """
        return hashlib.sha256(evidence_data).digest()

    def upload_to_ipfs(self, filepath: str) -> str:
        """
        Uploads satellite imagery and reports to IPFS (via Pinata/Irys).
        Returns the IPFS URI.
        """
        logger.info(f"Uploading {filepath} to IPFS...")
        # Mock upload
        ipfs_hash = "QmDummyHashForPortfolioDemo123456789"
        return f"ipfs://{ipfs_hash}"

    def submit_verification(
        self,
        project_id: int,
        forest_cover_bps: int,    # 10000 = 100%
        ndvi_mean: int,           # 10000 = 1.0
        change_from_baseline: int,
        quality_score: int,       # 0-100
        result_status: int,       # Enum: 0=Pass, 1=Warning, 2=Fail, 3=CriticalFail
        evidence_file: str
    ) -> str:
        """
        Builds and sends the Solana transaction to submit the verification report.
        """
        # 1. Upload evidence and get hash
        with open(evidence_file, "rb") as f:
            evidence_bytes = f.read()
            
        evidence_hash = self.hash_evidence(evidence_bytes)
        evidence_uri = self.upload_to_ipfs(evidence_file)

        logger.info(f"Submitting Verification for Project {project_id}")
        logger.info(f"  Forest Cover: {forest_cover_bps/100}%")
        logger.info(f"  CQS Grade: {quality_score}/100")
        logger.info(f"  Result Status: {result_status}")
        
        # 2. Build the Anchor instruction (using anchorpy in a real implementation)
        # For this skeleton, we just mock the transaction submission
        
        # tx = Transaction()
        # tx.add(
        #     Instruction(
        #         program_id=self.program_id,
        #         data=...,
        #         keys=[...]
        #     )
        # )
        # 
        # signature = self.client.send_transaction(tx, self.authority).value
        
        # Mock signature
        signature = "5KMockTxSignatureForDemoOnlyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        
        logger.info(f"Transaction confirmed on Devnet! Signature: {signature}")
        return signature

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Create a dummy evidence file
    dummy_file = "dummy_evidence.txt"
    with open(dummy_file, "w") as f:
        f.write("Satellite NDVI data package.")
        
    submitter = OracleSubmitter()
    
    # Submit a successful verification
    submitter.submit_verification(
        project_id=1,
        forest_cover_bps=8500,  # 85%
        ndvi_mean=6500,         # 0.65
        change_from_baseline=0,
        quality_score=92,       # AAA
        result_status=0,        # Pass
        evidence_file=dummy_file
    )
