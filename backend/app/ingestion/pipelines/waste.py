"""
SYMBIO Waste Listings & Live Operations Pipeline
Integrates company-created surplus declarations with validation, unit normalization,
and real-time event publishing.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.ingestion.normalizers.material import normalize_material_name
from backend.app.ingestion.normalizers.units import normalize_quantity_and_unit
from backend.app.ingestion.provenance.builder import ProvenanceBuilder

class WastePipeline:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run

    def process_waste_listing(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates, normalizes, and packages a company-created live waste listing.
        """
        raw_mat = payload.get("material_name") or payload.get("material", {}).get("name")
        if not raw_mat:
            raise ValueError("Waste listing must have a material name")

        mat_info = normalize_material_name(str(raw_mat))

        qty = float(payload.get("quantity", 0))
        unit = payload.get("unit", "tons")
        norm_units = normalize_quantity_and_unit(qty, unit)

        provenance = ProvenanceBuilder.build(
            source_name="COMPANY_SUBMISSION",
            source_record_id=payload.get("listing_id") or payload.get("id"),
            status="USER_PROVIDED",
            freshness="LIVE",
            confidence=1.0,
            license_name="Proprietary Operational Data"
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "listing_id": payload.get("listing_id") or f"LIST_{int(datetime.now().timestamp()*1000)}",
            "company_id": payload.get("company_id"),
            "facility_id": payload.get("facility_id"),
            "material_id": payload.get("material_id") or f"MAT_{abs(hash(mat_info['canonical_name']))}",
            "material_name": mat_info["canonical_name"],
            "material_class": mat_info["material_class"],
            "quantity": norm_units["value"],
            "unit": norm_units["unit"],
            "normalized_quantity": norm_units["normalized_value"],
            "normalized_unit": norm_units["normalized_unit"],
            "quality": payload.get("quality", "Standard Industrial Grade"),
            "available_from": payload.get("available_from") or now_iso,
            "available_until": payload.get("available_until"),
            "status": "AVAILABLE",
            "verification_status": "USER_PROVIDED",
            "freshness": "LIVE",
            "data_sources": [provenance],
            "created_at": now_iso,
            "updated_at": now_iso
        }
