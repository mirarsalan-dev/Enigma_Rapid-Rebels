"""
SYMBIO Materials & Material Observations Pipeline
Manages canonical material definitions and time-series material observations
(SURPLUS, DEMAND, CONSUMPTION, PROCESSING, STOCK, REUSE).
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.ingestion.cpcb.hazardous_waste import CPCBHazardousWasteIngestor
from backend.app.ingestion.normalizers.material import normalize_material_name
from backend.app.ingestion.normalizers.units import normalize_quantity_and_unit
from backend.app.ingestion.provenance.builder import ProvenanceBuilder

class MaterialPipeline:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.cpcb_ingestor = CPCBHazardousWasteIngestor(dry_run=dry_run)

    def run(self, limit: int = 500, state: Optional[str] = None) -> Dict[str, Any]:
        cpcb_res = self.cpcb_ingestor.run(limit=limit, state=state)
        return {
            "pipeline": "MATERIALS_AND_OBSERVATIONS",
            "dry_run": self.dry_run,
            "status": cpcb_res["status"],
            "records_fetched": cpcb_res["records_fetched"],
            "records_inserted": cpcb_res["records_inserted"],
            "records_updated": cpcb_res["records_updated"],
            "records_rejected": cpcb_res["records_rejected"],
            "source_breakdown": {
                "CPCB": cpcb_res
            }
        }
