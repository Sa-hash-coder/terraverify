"""
TerraVerify — NDVI Calculator
Computes Normalized Difference Vegetation Index from Sentinel-2 bands.
NDVI = (NIR - Red) / (NIR + Red)
"""

import logging
from dataclasses import dataclass

import numpy as np
import xarray as xr

logger = logging.getLogger(__name__)


@dataclass
class NDVIResult:
    """Results from NDVI computation."""
    ndvi_array: np.ndarray           # Full NDVI raster
    mean_ndvi: float                 # Mean NDVI across valid pixels
    median_ndvi: float               # Median NDVI
    std_ndvi: float                  # Standard deviation
    forest_cover_pct: float          # Percentage of pixels with NDVI > forest_threshold
    dense_vegetation_pct: float      # Percentage with NDVI > 0.7 (dense forest)
    sparse_vegetation_pct: float     # Percentage with 0.3 < NDVI < 0.6
    bare_soil_pct: float             # Percentage with NDVI < 0.2
    water_pct: float                 # Percentage with NDVI < 0
    valid_pixel_count: int           # Number of non-NaN pixels
    total_pixel_count: int           # Total pixels in raster
    pixel_resolution_m: float        # Spatial resolution in meters


class NDVICalculator:
    """
    Computes NDVI and vegetation statistics from satellite imagery.

    NDVI values interpretation:
        -1.0 to 0.0  → Water bodies, snow, clouds
         0.0 to 0.2  → Bare soil, rock, urban areas
         0.2 to 0.4  → Sparse vegetation, grassland
         0.4 to 0.6  → Moderate vegetation, cropland
         0.6 to 0.8  → Dense vegetation, healthy forest
         0.8 to 1.0  → Very dense, healthy tropical forest
    """

    # Thresholds for vegetation classification
    FOREST_THRESHOLD = 0.5       # NDVI above this = forest
    DENSE_FOREST_THRESHOLD = 0.7 # NDVI above this = dense forest
    SPARSE_VEG_LOW = 0.3
    SPARSE_VEG_HIGH = 0.6
    BARE_SOIL_THRESHOLD = 0.2
    WATER_THRESHOLD = 0.0

    def __init__(self, forest_threshold: float = 0.5):
        """
        Args:
            forest_threshold: NDVI threshold to classify a pixel as forest.
        """
        self.FOREST_THRESHOLD = forest_threshold

    def compute_ndvi(
        self,
        bands: dict[str, xr.DataArray],
        pixel_resolution_m: float = 10.0,
    ) -> NDVIResult:
        """
        Compute NDVI from Red (B04) and NIR (B08) bands.

        Args:
            bands: Dictionary with at least 'B04' (Red) and 'B08' (NIR) DataArrays.
            pixel_resolution_m: Spatial resolution in meters (Sentinel-2 = 10m).

        Returns:
            NDVIResult with computed statistics.
        """
        if "B04" not in bands or "B08" not in bands:
            raise ValueError("Bands dictionary must contain 'B04' (Red) and 'B08' (NIR)")

        red = bands["B04"].values.astype(np.float64)
        nir = bands["B08"].values.astype(np.float64)

        logger.info(f"Computing NDVI: Red shape={red.shape}, NIR shape={nir.shape}")

        # Compute NDVI with safe division
        numerator = nir - red
        denominator = nir + red

        # Avoid division by zero
        ndvi = np.where(
            denominator == 0,
            np.nan,
            numerator / denominator,
        )

        # Clip to valid NDVI range [-1, 1]
        ndvi = np.clip(ndvi, -1.0, 1.0)

        # Compute statistics on valid (non-NaN) pixels
        valid_mask = ~np.isnan(ndvi)
        valid_pixels = ndvi[valid_mask]
        valid_count = valid_pixels.size
        total_count = ndvi.size

        if valid_count == 0:
            logger.warning("No valid pixels found in NDVI computation")
            return NDVIResult(
                ndvi_array=ndvi,
                mean_ndvi=0.0, median_ndvi=0.0, std_ndvi=0.0,
                forest_cover_pct=0.0, dense_vegetation_pct=0.0,
                sparse_vegetation_pct=0.0, bare_soil_pct=0.0, water_pct=0.0,
                valid_pixel_count=0, total_pixel_count=total_count,
                pixel_resolution_m=pixel_resolution_m,
            )

        # Classification percentages
        forest_pct = (np.sum(valid_pixels >= self.FOREST_THRESHOLD) / valid_count) * 100
        dense_pct = (np.sum(valid_pixels >= self.DENSE_FOREST_THRESHOLD) / valid_count) * 100
        sparse_pct = (
            np.sum(
                (valid_pixels >= self.SPARSE_VEG_LOW) & (valid_pixels < self.SPARSE_VEG_HIGH)
            )
            / valid_count
        ) * 100
        bare_pct = (
            np.sum(
                (valid_pixels >= self.WATER_THRESHOLD) & (valid_pixels < self.BARE_SOIL_THRESHOLD)
            )
            / valid_count
        ) * 100
        water_pct = (np.sum(valid_pixels < self.WATER_THRESHOLD) / valid_count) * 100

        result = NDVIResult(
            ndvi_array=ndvi,
            mean_ndvi=float(np.nanmean(valid_pixels)),
            median_ndvi=float(np.nanmedian(valid_pixels)),
            std_ndvi=float(np.nanstd(valid_pixels)),
            forest_cover_pct=float(forest_pct),
            dense_vegetation_pct=float(dense_pct),
            sparse_vegetation_pct=float(sparse_pct),
            bare_soil_pct=float(bare_pct),
            water_pct=float(water_pct),
            valid_pixel_count=valid_count,
            total_pixel_count=total_count,
            pixel_resolution_m=pixel_resolution_m,
        )

        logger.info(
            f"NDVI computed: mean={result.mean_ndvi:.4f}, "
            f"forest={result.forest_cover_pct:.1f}%, "
            f"dense={result.dense_vegetation_pct:.1f}%"
        )

        return result

    def compute_forest_area_hectares(self, result: NDVIResult) -> float:
        """
        Calculate total forest area in hectares.

        Args:
            result: NDVIResult from compute_ndvi().

        Returns:
            Forest area in hectares.
        """
        pixel_area_m2 = result.pixel_resolution_m ** 2
        pixel_area_ha = pixel_area_m2 / 10_000  # 1 hectare = 10,000 m²

        forest_pixels = np.sum(
            (~np.isnan(result.ndvi_array)) & (result.ndvi_array >= self.FOREST_THRESHOLD)
        )
        forest_area_ha = float(forest_pixels) * pixel_area_ha

        logger.info(f"Forest area: {forest_area_ha:.2f} hectares ({forest_pixels} pixels)")
        return forest_area_ha

    def generate_classification_map(self, ndvi: np.ndarray) -> np.ndarray:
        """
        Generate a classified land cover map from NDVI.

        Returns:
            Integer array with classes:
                0 = No data
                1 = Water
                2 = Bare soil / Urban
                3 = Sparse vegetation
                4 = Moderate vegetation
                5 = Dense forest
        """
        classification = np.zeros_like(ndvi, dtype=np.uint8)

        classification[np.isnan(ndvi)] = 0                                         # No data
        classification[ndvi < self.WATER_THRESHOLD] = 1                            # Water
        classification[(ndvi >= self.WATER_THRESHOLD) & (ndvi < self.BARE_SOIL_THRESHOLD)] = 2  # Bare soil
        classification[(ndvi >= self.BARE_SOIL_THRESHOLD) & (ndvi < self.FOREST_THRESHOLD)] = 3  # Sparse veg
        classification[(ndvi >= self.FOREST_THRESHOLD) & (ndvi < self.DENSE_FOREST_THRESHOLD)] = 4  # Moderate
        classification[ndvi >= self.DENSE_FOREST_THRESHOLD] = 5                    # Dense forest

        logger.info("Classification map generated")
        return classification


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Demo with synthetic data
    print("NDVI Calculator — Demo with synthetic data")
    print("-" * 50)

    # Create synthetic satellite bands (simulating a forest scene)
    np.random.seed(42)
    h, w = 256, 256

    # Simulate a scene: forest in center, bare soil at edges
    red = np.random.uniform(200, 800, (1, h, w)).astype(np.float32)
    nir = np.random.uniform(2000, 4000, (1, h, w)).astype(np.float32)

    # Make center more "foresty" (high NIR, low Red)
    red[0, 50:200, 50:200] *= 0.3
    nir[0, 50:200, 50:200] *= 1.5

    bands = {
        "B04": xr.DataArray(red, dims=["band", "y", "x"]),
        "B08": xr.DataArray(nir, dims=["band", "y", "x"]),
    }

    calculator = NDVICalculator(forest_threshold=0.5)
    result = calculator.compute_ndvi(bands, pixel_resolution_m=10.0)

    print(f"\nResults:")
    print(f"  Mean NDVI:             {result.mean_ndvi:.4f}")
    print(f"  Forest cover:          {result.forest_cover_pct:.1f}%")
    print(f"  Dense vegetation:      {result.dense_vegetation_pct:.1f}%")
    print(f"  Sparse vegetation:     {result.sparse_vegetation_pct:.1f}%")
    print(f"  Bare soil:             {result.bare_soil_pct:.1f}%")
    print(f"  Water:                 {result.water_pct:.1f}%")
    print(f"  Valid pixels:          {result.valid_pixel_count:,}")

    forest_ha = calculator.compute_forest_area_hectares(result)
    print(f"  Forest area:           {forest_ha:.2f} hectares")
