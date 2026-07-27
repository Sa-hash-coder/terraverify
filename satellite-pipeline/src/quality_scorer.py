"""
TerraVerify — Credit Quality Score (CQS) AI Engine
Generates a 0-100 score for carbon credits based on satellite confidence,
project methodology, and historical verification track record.
"""

import logging
from dataclasses import dataclass
from typing import Dict, Any

logger = logging.getLogger(__name__)


@dataclass
class QualityScore:
    total_score: int          # 0-100
    satellite_confidence: int # 0-100 (weight 40%)
    methodology_score: int    # 0-100 (weight 20%)
    historical_score: int     # 0-100 (weight 30%)
    risk_deduction: int       # Penalty points for regional/fire risks (weight 10%)
    grade: str                # AAA, AA, A, BBB, etc.


class QualityScorer:
    """
    Evaluates the robustness of a carbon credit project.
    Fundraiser Differentiator #4: Automated, transparent credit quality rating.
    """

    # Base methodology scores
    METHODOLOGIES = {
        "VM0007": 85,  # REDD+
        "VM0015": 80,  # Avoided unplanned deforestation
        "AR-ACM0003": 95, # Afforestation/Reforestation
        "EXPERIMENTAL": 60,
    }

    def compute_score(
        self,
        project_data: Dict[str, Any],
        satellite_result: Dict[str, Any]
    ) -> QualityScore:
        """
        Compute the overall Credit Quality Score.
        """
        # 1. Satellite Confidence (How clear is the imagery?)
        # High cloud cover or low resolution reduces confidence
        cloud_cover = satellite_result.get("cloud_cover_pct", 10.0)
        resolution_m = satellite_result.get("resolution_m", 10.0)
        
        sat_conf = 100 - (cloud_cover * 2)  # 15% clouds -> 70 score
        if resolution_m > 20:
            sat_conf -= 10
        sat_conf = max(0, min(100, int(sat_conf)))

        # 2. Methodology Score
        methodology = project_data.get("methodology", "EXPERIMENTAL")
        meth_score = self.METHODOLOGIES.get(methodology, 50)

        # 3. Historical Track Record
        # Projects that have passed multiple verifications get higher scores
        verifications_passed = project_data.get("verifications_passed", 0)
        historical = min(100, 50 + (verifications_passed * 10))

        # 4. Risk Factors (Fire risk, geographic instability)
        # In a real system, this would query a global wildfire/risk API
        fire_risk_index = project_data.get("fire_risk_index", 0.0) # 0.0 to 1.0
        risk_deduction = int(fire_risk_index * 30)  # Max 30 point deduction

        # Weighted calculation
        total = (
            (sat_conf * 0.40) +
            (meth_score * 0.20) +
            (historical * 0.30)
        ) - risk_deduction

        total_score = max(0, min(100, int(total)))

        # Letter grade
        if total_score >= 90: grade = "AAA"
        elif total_score >= 80: grade = "AA"
        elif total_score >= 70: grade = "A"
        elif total_score >= 60: grade = "BBB"
        elif total_score >= 50: grade = "BB"
        else: grade = "C"

        logger.info(f"Generated CQS: {total_score}/100 (Grade: {grade}) for project {project_data.get('project_id')}")

        return QualityScore(
            total_score=total_score,
            satellite_confidence=sat_conf,
            methodology_score=meth_score,
            historical_score=historical,
            risk_deduction=risk_deduction,
            grade=grade
        )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    scorer = QualityScorer()
    
    # Example scoring
    mock_project = {
        "project_id": "PRJ-102",
        "methodology": "VM0007",
        "verifications_passed": 3,
        "fire_risk_index": 0.2
    }
    
    mock_satellite = {
        "cloud_cover_pct": 5.0,
        "resolution_m": 10.0
    }
    
    result = scorer.compute_score(mock_project, mock_satellite)
    print(f"Final Score: {result.total_score} ({result.grade})")
