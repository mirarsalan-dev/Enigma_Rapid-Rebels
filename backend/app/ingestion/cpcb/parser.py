"""
SYMBIO CPCB Report Parser & Reference Waste Model
Parses official Central Pollution Control Board (CPCB) National Hazardous and Other Waste Inventories.
Important: CPCB reports are REFERENCE/HISTORICAL annual data, NEVER live operational data.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class CPCBReportParser:
    """
    Parses structured inventories and tabular extractions from CPCB National Hazardous Waste Reports.
    """
    @staticmethod
    def parse_inventory_row(row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses an individual inventory entry into standard CPCB waste record.
        """
        return {
            "state": row.get("state") or row.get("state_name") or "National",
            "industry_sector": row.get("industry_sector") or row.get("sector") or "Industrial",
            "waste_category": row.get("waste_category") or row.get("stream") or "Schedule I/II Hazardous Waste",
            "waste_description": row.get("waste_description") or row.get("name") or "Industrial Byproduct",
            "quantity_mta": float(row.get("quantity_mta") or row.get("generation_mta") or 0.0),
            "recyclable_mta": float(row.get("recyclable_mta") or 0.0),
            "utilizable_mta": float(row.get("utilizable_mta") or 0.0),
            "landfillable_mta": float(row.get("landfillable_mta") or 0.0),
            "incinerable_mta": float(row.get("incinerable_mta") or 0.0),
            "reporting_year": str(row.get("reporting_year") or "2023-2024"),
            "document_ref": row.get("document_ref") or "CPCB National Inventory on Hazardous Waste Generation (Annual Report)"
        }
