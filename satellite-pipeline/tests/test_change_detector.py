"""
Unit tests for TerraVerify Change Detection Engine.
"""

import pytest
import numpy as np
from src.change_detector import ChangeDetector, ChangeResult


def test_no_change_is_compliant():
    detector = ChangeDetector()
    result = detector.compare_to_baseline(
        baseline_forest_pct=85.0,
        current_forest_pct=85.0,
        total_area_hectares=10000.0,
    )
    assert result.is_compliant is True
    assert result.status == "Pass"
    assert result.recommendation == "MINT_CREDITS"
    assert result.loss_percentage == 0.0


def test_warning_threshold():
    detector = ChangeDetector()
    # Baseline 85.0%, Current 82.5% => Loss = 2.5% (between 2.0% warning and 5.0% fail)
    result = detector.compare_to_baseline(
        baseline_forest_pct=85.0,
        current_forest_pct=82.5,
        total_area_hectares=10000.0,
    )
    assert result.is_compliant is True
    assert result.status == "Warning"
    assert result.recommendation == "REDUCE_MINTING"
    assert abs(result.loss_percentage - 2.5) < 1e-4


def test_fail_threshold_triggers_revocation():
    detector = ChangeDetector()
    # Baseline 85.0%, Current 79.0% => Loss = 6.0% (between 5.0% fail and 20.0% critical)
    result = detector.compare_to_baseline(
        baseline_forest_pct=85.0,
        current_forest_pct=79.0,
        total_area_hectares=10000.0,
    )
    assert result.is_compliant is False
    assert result.status == "Fail"
    assert result.recommendation == "SUSPEND_PROJECT"


def test_critical_fail_threshold():
    detector = ChangeDetector()
    # Baseline 85.0%, Current 60.0% => Loss = 25.0% (> 20.0% critical fail)
    result = detector.compare_to_baseline(
        baseline_forest_pct=85.0,
        current_forest_pct=60.0,
        total_area_hectares=10000.0,
    )
    assert result.is_compliant is False
    assert result.status == "CriticalFail"
    assert result.recommendation == "REVOKE_AND_BURN"
