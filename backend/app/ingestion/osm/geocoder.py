"""
SYMBIO Nominatim Geocoding Client
Safely geocodes industrial addresses with mandatory User-Agent, in-memory caching,
and strict avoidance of fabricated coordinates on failure.
"""
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, Tuple
from backend.app.ingestion.config import IngestionConfig
from backend.app.ingestion.normalizers.location import validate_coordinates, to_geojson_point

logger = logging.getLogger("SYMBIO.Geocoder")

class NominatimGeocoder:
    def __init__(self, endpoint_url: Optional[str] = None):
        self.endpoint_url = endpoint_url or IngestionConfig.NOMINATIM_URL
        self.user_agent = IngestionConfig.INGESTION_USER_AGENT
        self.timeout = IngestionConfig.DEFAULT_TIMEOUT_SECONDS
        self._cache: Dict[str, Optional[Dict[str, Any]]] = {}

    def geocode(self, address: str) -> Dict[str, Any]:
        """
        Geocodes address string.
        Returns:
        {
            "geocoding_status": "SUCCESS" | "FAILED",
            "latitude": float or None,
            "longitude": float or None,
            "display_name": str or None,
            "geojson": Dict or None
        }
        """
        if not address or not address.strip():
            return {
                "geocoding_status": "FAILED",
                "latitude": None,
                "longitude": None,
                "display_name": None,
                "geojson": None,
                "error": "Empty address provided"
            }

        cleaned_addr = address.strip()
        if cleaned_addr in self._cache:
            return self._cache[cleaned_addr]

        params = {
            "q": cleaned_addr,
            "format": "json",
            "limit": "1",
            "addressdetails": "1"
        }
        url = f"{self.endpoint_url}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "application/json"
            },
            method="GET"
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if not data or not isinstance(data, list):
                    res = {
                        "geocoding_status": "FAILED",
                        "latitude": None,
                        "longitude": None,
                        "display_name": None,
                        "geojson": None,
                        "error": "No match found"
                    }
                    self._cache[cleaned_addr] = res
                    return res

                first = data[0]
                lat = first.get("lat")
                lon = first.get("lon")
                coords = validate_coordinates(lat, lon)
                if not coords:
                    res = {
                        "geocoding_status": "FAILED",
                        "latitude": None,
                        "longitude": None,
                        "display_name": None,
                        "geojson": None,
                        "error": "Coordinates validation failed"
                    }
                    self._cache[cleaned_addr] = res
                    return res

                latitude, longitude = coords
                res = {
                    "geocoding_status": "SUCCESS",
                    "latitude": latitude,
                    "longitude": longitude,
                    "display_name": first.get("display_name"),
                    "geojson": to_geojson_point(latitude, longitude)
                }
                self._cache[cleaned_addr] = res
                return res

        except Exception as e:
            logger.warning(f"Geocoding request failed for '{cleaned_addr}': {e}")
            res = {
                "geocoding_status": "FAILED",
                "latitude": None,
                "longitude": None,
                "display_name": None,
                "geojson": None,
                "error": str(e)
            }
            self._cache[cleaned_addr] = res
            return res
