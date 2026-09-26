"""
SYMBIO Company Ingestion Pipeline
Coordinates multi-source company ingestion (MCA, UDYAM, Registered Entities)
with deduplication and strict provenance tracking.
"""
from typing import Dict, Any, List, Optional
from backend.app.ingestion.ogd.company_master import MCACompanyIngestor
from backend.app.ingestion.ogd.udyam import UdyamMSMEIngestor

class CompanyPipeline:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.mca_ingestor = MCACompanyIngestor(dry_run=dry_run)
        self.udyam_ingestor = UdyamMSMEIngestor(dry_run=dry_run)

    def run(self, limit: int = 500, state: Optional[str] = None) -> Dict[str, Any]:
        mca_result = self.mca_ingestor.run(limit=limit, state=state)
        udyam_result = self.udyam_ingestor.run(limit=limit, state=state)

        total_fetched = mca_result["records_fetched"] + udyam_result["records_fetched"]
        total_inserted = mca_result["records_inserted"] + udyam_result["records_inserted"]
        total_updated = mca_result["records_updated"] + udyam_result["records_updated"]
        total_rejected = mca_result["records_rejected"] + udyam_result["records_rejected"]

        return {
            "pipeline": "COMPANIES",
            "dry_run": self.dry_run,
            "status": "SUCCESS" if (mca_result["status"] == "SUCCESS" and udyam_result["status"] == "SUCCESS") else "PARTIAL",
            "sources": {
                "MCA": mca_result,
                "UDYAM": udyam_result
            },
            "records_fetched": total_fetched,
            "records_inserted": total_inserted,
            "records_updated": total_updated,
            "records_rejected": total_rejected
        }
