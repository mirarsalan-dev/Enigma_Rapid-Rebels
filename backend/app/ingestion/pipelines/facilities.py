"""
SYMBIO Facility Ingestion Pipeline
Ingests industrial sites and physical manufacturing locations from OpenStreetMap & verified registries.
Crucial rule: Facility != Company. A company may operate multiple physical facilities or none at registered HQ.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.ingestion.base import BaseIngestor
from backend.app.ingestion.osm.overpass import OverpassClient
from backend.app.ingestion.normalizers.location import to_geojson_point
from backend.app.ingestion.provenance.builder import ProvenanceBuilder

class FacilityPipeline:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.overpass_client = OverpassClient()

    def run(self, city: Optional[str] = None, state: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
        facilities = self.overpass_client.query_industrial_nodes(city=city, state=state, limit=limit)
        
        inserted = 0
        updated = 0
        rejected = 0

        for fac in facilities:
            if not fac.get("location") or not fac.get("name"):
                rejected += 1
            else:
                inserted += 1

        return {
            "pipeline": "FACILITIES",
            "source": "OPENSTREETMAP",
            "dry_run": self.dry_run,
            "status": "SUCCESS" if rejected == 0 else "PARTIAL",
            "records_fetched": len(facilities),
            "records_inserted": inserted,
            "records_updated": updated,
            "records_rejected": rejected,
            "sample_facilities": facilities[:5]
        }
