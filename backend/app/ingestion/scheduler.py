"""
SYMBIO Ingestion Scheduler & Coordinator
Manages scheduled jobs for periodic reference datasets and coordinates on-demand runs.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from backend.app.ingestion.pipelines.companies import CompanyPipeline
from backend.app.ingestion.pipelines.facilities import FacilityPipeline
from backend.app.ingestion.pipelines.materials import MaterialPipeline

logger = logging.getLogger("SYMBIO.Scheduler")

class IngestionScheduler:
    def __init__(self):
        self.run_history: List[Dict[str, Any]] = []

    def trigger_all(self, state: str = "Maharashtra", dry_run: bool = False) -> Dict[str, Any]:
        """
        Executes a complete ingestion cycle across all providers.
        """
        started = datetime.now(timezone.utc).isoformat()
        logger.info(f"Triggering global ingestion run (state={state}, dry_run={dry_run})")

        comp_pipeline = CompanyPipeline(dry_run=dry_run)
        fac_pipeline = FacilityPipeline(dry_run=dry_run)
        mat_pipeline = MaterialPipeline(dry_run=dry_run)

        comp_res = comp_pipeline.run(limit=500, state=state)
        fac_res = fac_pipeline.run(state=state, limit=100)
        mat_res = mat_pipeline.run(limit=500, state=state)

        total_fetched = comp_res["records_fetched"] + fac_res["records_fetched"] + mat_res["records_fetched"]
        total_inserted = comp_res["records_inserted"] + fac_res["records_inserted"] + mat_res["records_inserted"]
        total_updated = comp_res["records_updated"] + fac_res["records_updated"] + mat_res["records_updated"]
        total_rejected = comp_res["records_rejected"] + fac_res["records_rejected"] + mat_res["records_rejected"]

        status = "SUCCESS" if total_rejected == 0 else "PARTIAL"
        completed = datetime.now(timezone.utc).isoformat()

        run_record = {
            "run_id": f"RUN_{int(datetime.now().timestamp()*1000)}",
            "started_at": started,
            "completed_at": completed,
            "status": status,
            "state_filter": state,
            "dry_run": dry_run,
            "records_fetched": total_fetched,
            "records_inserted": total_inserted,
            "records_updated": total_updated,
            "records_rejected": total_rejected,
            "pipeline_results": {
                "companies": comp_res,
                "facilities": fac_res,
                "materials": mat_res
            }
        }
        self.run_history.append(run_record)
        return run_record
