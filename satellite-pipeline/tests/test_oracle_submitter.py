"""
Unit tests for TerraVerify Oracle Submitter.
"""

import pytest
import os
from src.oracle_submitter import OracleSubmitter


def test_hash_evidence():
    submitter = OracleSubmitter()
    data = b"Sample satellite NDVI evidence payload"
    h1 = submitter.hash_evidence(data)
    h2 = submitter.hash_evidence(data)

    assert len(h1) == 32
    assert h1 == h2


def test_submit_verification_generates_signature(tmp_path):
    test_file = tmp_path / "evidence.txt"
    test_file.write_text("NDVI test evidence package")

    submitter = OracleSubmitter()
    sig = submitter.submit_verification(
        project_id=1,
        forest_cover_bps=8800,
        ndvi_mean=8100,
        change_from_baseline=0,
        quality_score=94,
        result_status=0,
        evidence_file=str(test_file),
    )

    assert sig is not None
    assert len(sig) > 20

