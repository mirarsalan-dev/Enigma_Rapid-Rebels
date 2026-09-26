"""
SYMBIO Industrial Unit Normalizer
Normalizes mass and volume units into standardized metrics (TONNE, LITRE, M3)
while strictly preserving the original unit and value.
"""
from typing import Dict, Any, Optional

# Supported mass normalization target: TONNE (metric ton)
MASS_CONVERSIONS_TO_TONNE = {
    "t": 1.0,
    "ton": 1.0,
    "tons": 1.0,
    "tonne": 1.0,
    "tonnes": 1.0,
    "mt": 1.0,
    "metric ton": 1.0,
    "metric tons": 1.0,
    "kg": 0.001,
    "kgs": 0.001,
    "kilogram": 0.001,
    "kilograms": 0.001,
    "g": 0.000001,
    "gram": 0.000001,
    "grams": 0.000001,
    "quintal": 0.1,
    "quintals": 0.1,
    "lbs": 0.00045359237,
    "pound": 0.00045359237,
    "pounds": 0.00045359237,
}

VOLUME_CONVERSIONS_TO_LITRE = {
    "l": 1.0,
    "ltr": 1.0,
    "liter": 1.0,
    "liters": 1.0,
    "litre": 1.0,
    "litres": 1.0,
    "kl": 1000.0,
    "kilolitre": 1000.0,
    "kilolitres": 1000.0,
    "ml": 0.001,
    "milliliter": 0.001,
}

VOLUME_CONVERSIONS_TO_M3 = {
    "m3": 1.0,
    "m^3": 1.0,
    "cu m": 1.0,
    "cubic meter": 1.0,
    "cubic meters": 1.0,
    "cubic metre": 1.0,
    "cubic metres": 1.0,
}

def normalize_quantity_and_unit(value: float, unit_str: str) -> Dict[str, Any]:
    """
    Normalizes a numerical quantity and its unit into canonical standard units:
    - Mass -> TONNE
    - Liquid volume -> LITRE
    - Solid volume -> M3
    Preserves original value and unit.
    Raises ValueError if unit is invalid or value is negative.
    """
    if value is None or value < 0:
        raise ValueError(f"Quantity value cannot be negative or None, got {value}")

    if not unit_str or not isinstance(unit_str, str):
        raise ValueError(f"Invalid unit string: {unit_str}")

    cleaned_unit = unit_str.strip().lower()

    # Check Mass
    if cleaned_unit in MASS_CONVERSIONS_TO_TONNE:
        factor = MASS_CONVERSIONS_TO_TONNE[cleaned_unit]
        normalized_value = round(value * factor, 6)
        return {
            "value": float(value),
            "unit": unit_str.strip(),
            "normalized_value": normalized_value,
            "normalized_unit": "TONNE",
            "unit_category": "MASS"
        }

    # Check Liquid Volume
    if cleaned_unit in VOLUME_CONVERSIONS_TO_LITRE:
        factor = VOLUME_CONVERSIONS_TO_LITRE[cleaned_unit]
        normalized_value = round(value * factor, 6)
        return {
            "value": float(value),
            "unit": unit_str.strip(),
            "normalized_value": normalized_value,
            "normalized_unit": "LITRE",
            "unit_category": "VOLUME_LIQUID"
        }

    # Check Bulk Volume
    if cleaned_unit in VOLUME_CONVERSIONS_TO_M3:
        factor = VOLUME_CONVERSIONS_TO_M3[cleaned_unit]
        normalized_value = round(value * factor, 6)
        return {
            "value": float(value),
            "unit": unit_str.strip(),
            "normalized_value": normalized_value,
            "normalized_unit": "M3",
            "unit_category": "VOLUME_BULK"
        }

    # Units (Count / Pieces)
    if cleaned_unit in {"pieces", "pcs", "units", "items", "drums", "barrels"}:
        return {
            "value": float(value),
            "unit": unit_str.strip(),
            "normalized_value": float(value),
            "normalized_unit": "PIECES",
            "unit_category": "COUNT"
        }

    raise ValueError(f"Unsupported unit for industrial normalization: '{unit_str}'")
