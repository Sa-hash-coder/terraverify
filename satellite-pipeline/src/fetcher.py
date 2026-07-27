"""
TerraVerify — Satellite Data Fetcher
Downloads Sentinel-2 L2A imagery from Microsoft Planetary Computer STAC API.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
import pystac_client
import planetary_computer
import rioxarray
import xarray as xr

logger = logging.getLogger(__name__)


class SatelliteFetcher:
    """
    Fetches Sentinel-2 L2A satellite imagery for a given bounding box
    from Microsoft Planetary Computer (free, no API key needed).
    """

    STAC_API_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
    COLLECTION = "sentinel-2-l2a"

    # Sentinel-2 bands we need for analysis
    # B02 = Blue (490nm), B03 = Green (560nm), B04 = Red (665nm), B08 = NIR (842nm)
    BANDS = ["B02", "B03", "B04", "B08"]

    # Scene Classification Layer for cloud masking
    SCL_BAND = "SCL"

    def __init__(self, max_cloud_cover: float = 15.0):
        """
        Args:
            max_cloud_cover: Maximum cloud cover percentage (0-100) to filter scenes.
        """
        self.max_cloud_cover = max_cloud_cover
        self.catalog = pystac_client.Client.open(
            self.STAC_API_URL,
            modifier=planetary_computer.sign_inplace,
        )
        logger.info("SatelliteFetcher initialized with Planetary Computer STAC API")

    def search_scenes(
        self,
        bbox: list[float],
        date_start: str,
        date_end: Optional[str] = None,
        max_items: int = 5,
    ) -> list:
        """
        Search for Sentinel-2 scenes covering the given bounding box.

        Args:
            bbox: [min_lon, min_lat, max_lon, max_lat] in WGS84
            date_start: Start date (YYYY-MM-DD)
            date_end: End date (YYYY-MM-DD). Defaults to today.
            max_items: Maximum scenes to return, sorted by cloud cover (ascending).

        Returns:
            List of STAC items sorted by cloud cover.
        """
        if date_end is None:
            date_end = datetime.now().strftime("%Y-%m-%d")

        date_range = f"{date_start}/{date_end}"

        logger.info(f"Searching Sentinel-2 scenes: bbox={bbox}, dates={date_range}, max_cloud={self.max_cloud_cover}%")

        search = self.catalog.search(
            collections=[self.COLLECTION],
            bbox=bbox,
            datetime=date_range,
            query={"eo:cloud_cover": {"lt": self.max_cloud_cover}},
            sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
            max_items=max_items,
        )

        items = list(search.items())
        logger.info(f"Found {len(items)} scenes")

        for item in items:
            cloud = item.properties.get("eo:cloud_cover", "N/A")
            logger.info(f"  Scene {item.id}: cloud_cover={cloud}%, date={item.datetime}")

        return items

    def fetch_bands(
        self,
        item,
        bbox: Optional[list[float]] = None,
    ) -> dict[str, xr.DataArray]:
        """
        Fetch spectral bands from a STAC item as xarray DataArrays.

        Args:
            item: A STAC item from search_scenes().
            bbox: Optional sub-bbox to clip the data.

        Returns:
            Dictionary mapping band name → xarray DataArray.
        """
        bands_data = {}

        for band_name in self.BANDS + [self.SCL_BAND]:
            if band_name not in item.assets:
                logger.warning(f"Band {band_name} not found in item {item.id}")
                continue

            href = item.assets[band_name].href
            logger.info(f"Fetching band {band_name} from {item.id}")

            da = rioxarray.open_rasterio(href, masked=True)

            # Clip to bounding box if provided
            if bbox is not None:
                from shapely.geometry import box as shapely_box
                clip_geom = shapely_box(*bbox)
                da = da.rio.clip([clip_geom], crs="EPSG:4326")

            bands_data[band_name] = da.astype(np.float32)

        return bands_data

    def fetch_latest(
        self,
        bbox: list[float],
        lookback_days: int = 30,
    ) -> tuple[dict[str, xr.DataArray], dict]:
        """
        Convenience method: fetch the latest, clearest scene for a bbox.

        Args:
            bbox: [min_lon, min_lat, max_lon, max_lat]
            lookback_days: How far back to search.

        Returns:
            Tuple of (bands_data dict, scene metadata dict)
        """
        date_start = (datetime.now() - timedelta(days=lookback_days)).strftime("%Y-%m-%d")

        scenes = self.search_scenes(bbox, date_start, max_items=3)

        if not scenes:
            raise ValueError(
                f"No cloud-free Sentinel-2 scenes found for bbox={bbox} "
                f"in the last {lookback_days} days. Try increasing lookback_days."
            )

        best_scene = scenes[0]  # Already sorted by cloud cover
        bands = self.fetch_bands(best_scene, bbox=bbox)

        metadata = {
            "scene_id": best_scene.id,
            "datetime": str(best_scene.datetime),
            "cloud_cover": best_scene.properties.get("eo:cloud_cover"),
            "bbox": bbox,
            "collection": self.COLLECTION,
            "platform": best_scene.properties.get("platform", "sentinel-2"),
        }

        logger.info(f"Selected scene: {metadata['scene_id']} (cloud: {metadata['cloud_cover']}%)")

        return bands, metadata

    def apply_cloud_mask(
        self,
        bands: dict[str, xr.DataArray],
    ) -> dict[str, xr.DataArray]:
        """
        Apply Scene Classification Layer (SCL) cloud mask to spectral bands.

        SCL values:
            0: No data, 1: Saturated, 2: Dark area, 3: Cloud shadow,
            4: Vegetation, 5: Bare soil, 6: Water, 7: Unclassified,
            8: Cloud (medium prob), 9: Cloud (high prob), 10: Cirrus, 11: Snow/Ice

        We keep: 4 (Vegetation), 5 (Bare soil), 6 (Water), 7 (Unclassified)
        We mask: 0, 1, 3, 8, 9, 10, 11
        """
        if self.SCL_BAND not in bands:
            logger.warning("No SCL band available, skipping cloud masking")
            return bands

        scl = bands[self.SCL_BAND]

        # Valid pixels: vegetation (4), bare soil (5), water (6), unclassified (7)
        valid_mask = (scl >= 4) & (scl <= 7)

        masked_bands = {}
        for name, da in bands.items():
            if name == self.SCL_BAND:
                continue

            # Resample SCL to match band resolution if needed
            if da.shape != scl.shape:
                valid_resampled = valid_mask.rio.reproject_match(da)
            else:
                valid_resampled = valid_mask

            masked_bands[name] = da.where(valid_resampled)

        logger.info("Cloud masking applied using SCL band")
        return masked_bands


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Example: Fetch data for a small region in the Amazon
    amazon_bbox = [-62.5, -3.5, -62.3, -3.3]  # Small test area

    fetcher = SatelliteFetcher(max_cloud_cover=15.0)

    # Search for scenes
    scenes = fetcher.search_scenes(amazon_bbox, "2024-01-01", "2024-06-30")

    if scenes:
        print(f"\nBest scene: {scenes[0].id}")
        print(f"Cloud cover: {scenes[0].properties['eo:cloud_cover']}%")
        print(f"Date: {scenes[0].datetime}")
