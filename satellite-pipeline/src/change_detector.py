"""
TerraVerify — Change Detection Engine
Compares current forest cover against baseline to detect deforestation
and trigger smart contract revocations if necessary.
"""

import logging
from dataclasses import dataclass
from typing import Tuple

import numpy as np

logger = logging.getLogger(__name__)

@dataclass
class ChangeResult:
    is_compliant: bool
    status: str             # Pass, Warning, Fail, CriticalFail
    loss_percentage: float  # Percentage points lost vs baseline
    loss_hectares: float    
    recommendation: str     # Mint, Pause, Revoke

class ChangeDetector:
    """
    Analyzes changes in forest cover over time.
    Fundraiser Differentiator #3: Automated Revocation trigger.
    """

    # Thresholds for status determination (percentage point loss)
    WARNING_THRESHOLD = 2.0
    FAIL_THRESHOLD = 5.0
    CRITICAL_FAIL_THRESHOLD = 20.0

    def compare_to_baseline(
        self,
        baseline_forest_pct: float,
        current_forest_pct: float,
        total_area_hectares: float
    ) -> ChangeResult:
        """
        Compare current forest cover to the baseline registered in the smart contract.
        """
        loss_pct = baseline_forest_pct - current_forest_pct
        
        # If negative loss, forest grew (Pass)
        if loss_pct <= 0:
            loss_pct = 0.0

        loss_hectares = (loss_pct / 100.0) * total_area_hectares

        if loss_pct >= self.CRITICAL_FAIL_THRESHOLD:
            status = "CriticalFail"
            is_compliant = False
            recommendation = "REVOKE_AND_BURN"
            logger.critical(f"CATASTROPHIC DEFORESTATION: {loss_pct:.1f}% loss detected.")
        elif loss_pct >= self.FAIL_THRESHOLD:
            status = "Fail"
            is_compliant = False
            recommendation = "SUSPEND_PROJECT"
            logger.error(f"MAJOR DEFORESTATION: {loss_pct:.1f}% loss detected.")
        elif loss_pct >= self.WARNING_THRESHOLD:
            status = "Warning"
            is_compliant = True  # Still compliant, but flagged
            recommendation = "REDUCE_MINTING"
            logger.warning(f"MINOR DEFORESTATION: {loss_pct:.1f}% loss detected.")
        else:
            status = "Pass"
            is_compliant = True
            recommendation = "MINT_CREDITS"
            logger.info("Project compliant. No significant deforestation.")

        return ChangeResult(
            is_compliant=is_compliant,
            status=status,
            loss_percentage=loss_pct,
            loss_hectares=loss_hectares,
            recommendation=recommendation
        )

    def generate_change_mask(
        self,
        baseline_mask: np.ndarray,
        current_mask: np.ndarray
    ) -> np.ndarray:
        """
        Generates a spatial mask of exactly where deforestation occurred.
        Returns array where 1 = Deforested pixel.
        """
        # Baseline = 1 (forest), Current = 0 (non-forest)
        loss_mask = (baseline_mask == 1) & (current_mask == 0)
        return loss_mask.astype(np.uint8)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    detector = ChangeDetector()
    
    # Simulate a critical failure (e.g. illegal logging or fire)
    print("Testing Change Detector:")
    result = detector.compare_to_baseline(
        baseline_forest_pct=85.0,
        current_forest_pct=60.0,  # 25% drop!
        total_area_hectares=1000.0
    )
    
    print(f"Status: {result.status}")
    print(f"Action: {result.recommendation}")
    print(f"Lost Area: {result.loss_hectares} hectares")
