"""
TerraVerify — Forest Canopy Segmentation & Classification Neural Networks
Processes multi-spectral Sentinel-2 bands (Blue, Green, Red, NIR) to predict pixel-level forest density
and detect subtle deforestation anomalies.
"""

from typing import Tuple, Dict, Any, Optional
import torch
import torch.nn as nn
import torch.nn.functional as F


class DoubleConv(nn.Module):
    """Two convolutional layers with BatchNorm and ReLU activation."""
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


class ForestSegmentationModel(nn.Module):
    """
    Lightweight U-Net architecture adapted for 4-channel Sentinel-2 satellite imagery
    (B02 Blue, B03 Green, B04 Red, B08 NIR).
    Outputs binary forest mask and continuous canopy density map (0.0 to 1.0).
    """

    def __init__(self, in_channels: int = 4, num_classes: int = 2):
        super().__init__()
        self.in_channels = in_channels
        self.num_classes = num_classes

        # Encoder (Downsampling)
        self.inc = DoubleConv(in_channels, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))

        # Bottleneck
        self.bottleneck = DoubleConv(256, 256)

        # Decoder (Upsampling)
        self.up1 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(256, 128)

        self.up2 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(128, 64)

        self.up3 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(64, 32)

        # Output heads
        self.out_seg = nn.Conv2d(32, num_classes, kernel_size=1)
        self.out_density = nn.Sequential(
            nn.Conv2d(32, 1, kernel_size=1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        # Encoder
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)

        # Bottleneck
        bn = self.bottleneck(x4)

        # Decoder with skip connections
        u1 = self.up1(bn)
        u1 = torch.cat([x3, u1], dim=1)
        d1 = self.conv_up1(u1)

        u2 = self.up2(d1)
        u2 = torch.cat([x2, u2], dim=1)
        d2 = self.conv_up2(u2)

        u3 = self.up3(d2)
        u3 = torch.cat([x1, u3], dim=1)
        d3 = self.conv_up3(u3)

        # Outputs
        segmentation = self.out_seg(d3)
        density = self.out_density(d3)

        return {
            "logits": segmentation,
            "mask": torch.argmax(segmentation, dim=1),
            "density": density.squeeze(1),
        }


class CanopyClassifier(nn.Module):
    """
    Classifies a parcel scene into health / risk tiers:
    0: Intact Primary Forest (AAA)
    1: Sustainable Regeneration (AA)
    2: Stable Secondary Forest (A)
    3: Moderate Encroachment (B)
    4: Deforestation Event / High Risk (C)
    """

    def __init__(self, in_channels: int = 4, num_tiers: int = 5):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, 32),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(32, num_tiers),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)
        return self.classifier(feat)

