"""
SYMBIO Geospatial & Location Normalizer
Validates coordinates and creates canonical GeoJSON Point objects.
Crucial rule: NEVER fabricate coordinates when missing or invalid.
"""
from typing import Optional, Dict, Any, Tuple

def validate_coordinates(lat: Any, lng: Any) -> Optional[Tuple[float, float]]:
    """
    Validates latitude and longitude.
    Returns (latitude, longitude) as floats if valid, or None if invalid.
    """
    if lat is None or lng is None:
        return None

    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except (ValueError, TypeError):
        return None

    # Boundary checks: -90 <= lat <= 90 and -180 <= lng <= 180
    if not (-90.0 <= lat_f <= 90.0):
        return None
    if not (-180.0 <= lng_f <= 180.0):
        return None

    # Check for (0,0) null-island unless explicitly intended
    if abs(lat_f) < 1e-6 and abs(lng_f) < 1e-6:
        return None

    return (round(lat_f, 6), round(lng_f, 6))

def to_geojson_point(lat: Any, lng: Any) -> Optional[Dict[str, Any]]:
    """
    Creates a valid GeoJSON Point dictionary:
    {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }
    Returns None if coordinates are invalid.
    """
    coords = validate_coordinates(lat, lng)
    if not coords:
        return None

    latitude, longitude = coords
    return {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }
