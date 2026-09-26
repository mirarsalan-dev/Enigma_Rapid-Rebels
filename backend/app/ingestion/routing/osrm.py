"""
SYMBIO OSRM Routing Engine
Queries OSRM for real road distance, duration, and road geometry between industrial sites.
Rule: NEVER ask an LLM to calculate road distances or ETAs.
"""
import json
import logging
import math
import urllib.request
from typing import Dict, Any, Tuple, Optional
from backend.app.ingestion.config import IngestionConfig

logger = logging.getLogger("SYMBIO.OSRM")

class OSRMRoutingClient:
    def __init__(self, endpoint_url: Optional[str] = None):
        self.endpoint_url = (endpoint_url or IngestionConfig.OSRM_URL).rstrip('/')
        self.user_agent = IngestionConfig.INGESTION_USER_AGENT
        self.timeout = IngestionConfig.DEFAULT_TIMEOUT_SECONDS
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get_route(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float
    ) -> Dict[str, Any]:
        """
        Calculates driving route between origin and destination using OSRM.
        Coordinates order for OSRM URL: {lng},{lat};{lng},{lat}
        """
        cache_key = f"{origin_lat:.4f},{origin_lng:.4f}->{dest_lat:.4f},{dest_lng:.4f}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        osrm_url = f"{self.endpoint_url}/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson"

        req = urllib.request.Request(
            osrm_url,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "application/json"
            },
            method="GET"
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("code") == "Ok" and data.get("routes"):
                    primary = data["routes"][0]
                    dist_m = float(primary.get("distance", 0.0))
                    dur_s = float(primary.get("duration", 0.0))
                    geometry = primary.get("geometry")

                    result = {
                        "status": "SUCCESS",
                        "distance_m": round(dist_m, 2),
                        "distance_km": round(dist_m / 1000.0, 2),
                        "duration_s": round(dur_s, 2),
                        "duration_minutes": round(dur_s / 60.0, 1),
                        "geometry": geometry,
                        "source": "OSRM_API"
                    }
                    self._cache[cache_key] = result
                    return result
        except Exception as e:
            logger.warning(f"OSRM service call failed ({e}). Calculating calibrated road geodesic distance.")

        # Fallback: Calibrated Haversine with standard industrial road detour index (1.28)
        fallback = self._calculate_calibrated_distance(origin_lat, origin_lng, dest_lat, dest_lng)
        self._cache[cache_key] = fallback
        return fallback

    def _calculate_calibrated_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, Any]:
        """
        Computes great-circle distance scaled by highway detour factor (1.28) and avg heavy haul speed (45 km/h).
        """
        R = 6371.0 # Earth radius km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        aerial_km = R * c

        road_km = aerial_km * 1.28
        dist_m = road_km * 1000.0
        avg_speed_kmh = 45.0
        dur_hours = road_km / avg_speed_kmh
        dur_s = dur_hours * 3600.0

        return {
            "status": "CALIBRATED_FALLBACK",
            "distance_m": round(dist_m, 2),
            "distance_km": round(road_km, 2),
            "duration_s": round(dur_s, 2),
            "duration_minutes": round(dur_s / 60.0, 1),
            "geometry": {
                "type": "LineString",
                "coordinates": [[lon1, lat1], [lon2, lat2]]
            },
            "source": "CALIBRATED_GEODESIC"
        }
