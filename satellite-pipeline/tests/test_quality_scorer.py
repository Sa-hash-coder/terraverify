"""
Unit tests for TerraVerify Credit Quality Score (CQS) AI Engine.
"""

import pytest
from src.quality_scorer import QualityScorer, QualityScore


def test_high_quality_project_receives_aaa():
    scorer = QualityScorer()
    project_data = {
        "methodology": "AR-ACM0003",
        "verifications_passed": 5,
        "region": "Costa Rica",
        "fire_risk_index": 0.0,
    }
    satellite_result = {
        "cloud_cover_pct": 2.0,
        "resolution_m": 10.0,
    }

    score = scorer.compute_score(project_data, satellite_result)
    assert isinstance(score, QualityScore)
    # sat_conf = 96, meth = 95, historical = 100 => (96*0.4) + (95*0.2) + (100*0.3) = 38.4 + 19 + 30 = 87.4 => 87
    assert score.total_score >= 80
    assert score.grade in ["AAA", "AA"]


def test_high_cloud_cover_penalizes_confidence():
    scorer = QualityScorer()
    project_data = {
        "methodology": "VM0007",
        "verifications_passed": 1,
        "region": "Brazil",
    }
    satellite_clean = {
        "cloud_cover_pct": 5.0,
        "resolution_m": 10.0,
    }
    satellite_cloudy = {
        "cloud_cover_pct": 40.0,
        "resolution_m": 10.0,
    }

    score_clean = scorer.compute_score(project_data, satellite_clean)
    score_cloudy = scorer.compute_score(project_data, satellite_cloudy)

    assert score_cloudy.satellite_confidence < score_clean.satellite_confidence
    assert score_cloudy.total_score < score_clean.total_score
