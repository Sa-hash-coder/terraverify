"""
Unit tests for Machine Learning models in satellite pipeline.
"""

import pytest
import torch
from models.forest_segmentation import ForestSegmentationModel, CanopyClassifier


def test_forest_segmentation_forward():
    model = ForestSegmentationModel(in_channels=4, num_classes=2)
    model.eval()

    # Input: batch of 2, 4 channels (B, G, R, NIR), 64x64 pixels
    dummy_input = torch.randn(2, 4, 64, 64)

    with torch.no_grad():
        output = model(dummy_input)

    assert "logits" in output
    assert "mask" in output
    assert "density" in output

    assert output["logits"].shape == (2, 2, 64, 64)
    assert output["mask"].shape == (2, 64, 64)
    assert output["density"].shape == (2, 64, 64)
    # Density should be bounded in [0, 1] due to sigmoid
    assert (output["density"] >= 0.0).all() and (output["density"] <= 1.0).all()


def test_canopy_classifier_forward():
    classifier = CanopyClassifier(in_channels=4, num_tiers=5)
    classifier.eval()

    dummy_input = torch.randn(3, 4, 32, 32)
    with torch.no_grad():
        logits = classifier(dummy_input)

    assert logits.shape == (3, 5)

