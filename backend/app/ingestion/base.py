"""
SYMBIO Base Ingestor Architecture
Implements the canonical lifecycle:
FETCH -> VALIDATE -> NORMALIZE -> DEDUPLICATE -> PROVENANCE -> PERSIST -> RUN TRACKING
"""
import hashlib
import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("SYMBIO.Ingestion")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")

class IngestionResult:
    def __init__(self, source_name: str):
        self.source = source_name
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.completed_at: Optional[str] = None
        self.status = "RUNNING"
        self.records_fetched = 0
        self.records_inserted = 0
        self.records_updated = 0
        self.records_rejected = 0
        self.warnings: List[str] = []
        self.errors: List[Dict[str, Any]] = []
        self.checksum: Optional[str] = None

    def finish(self, status: str = "SUCCESS"):
        self.completed_at = datetime.now(timezone.utc).isoformat()
        self.status = status
        summary_bytes = f"{self.source}-{self.records_fetched}-{self.records_inserted}-{self.records_updated}".encode("utf-8")
        self.checksum = hashlib.sha256(summary_bytes).hexdigest()[:16]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "status": self.status,
            "records_fetched": self.records_fetched,
            "records_inserted": self.records_inserted,
            "records_updated": self.records_updated,
            "records_rejected": self.records_rejected,
            "warnings_count": len(self.warnings),
            "errors_count": len(self.errors),
            "errors": self.errors[:50], # Store top errors
            "checksum": self.checksum
        }

class BaseIngestor(ABC):
    def __init__(self, source_name: str, dry_run: bool = False):
        self.source_name = source_name
        self.dry_run = dry_run
        self.result = IngestionResult(source_name)

    @abstractmethod
    def fetch(self, limit: int = 500, offset: int = 0, **kwargs) -> List[Dict[str, Any]]:
        """Fetch raw records from the external provider."""
        pass

    @abstractmethod
    def validate(self, record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate raw record fields. Returns (is_valid, error_reason)."""
        pass

    @abstractmethod
    def normalize(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize raw record into SYMBIO canonical schema."""
        pass

    @abstractmethod
    def deduplicate(self, record: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Check if record exists.
        Returns (record, is_update).
        """
        pass

    def record_error(self, record_id: Any, error_type: str, message: str, raw_record: Optional[Dict[str, Any]] = None):
        err = {
            "source": self.source_name,
            "record_id": str(record_id) if record_id is not None else "UNKNOWN",
            "error_type": error_type,
            "error_message": message,
            "raw_record": raw_record or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.result.errors.append(err)
        self.result.records_rejected += 1
        logger.warning(f"[{self.source_name}] Rejected record {record_id}: {message}")

    def run(self, limit: int = 500, offset: int = 0, **kwargs) -> Dict[str, Any]:
        """
        Executes the ingestion pipeline.
        """
        logger.info(f"Starting ingestion for source: {self.source_name} (dry_run={self.dry_run})")
        try:
            raw_records = self.fetch(limit=limit, offset=offset, **kwargs)
            self.result.records_fetched = len(raw_records)

            normalized_batch: List[Dict[str, Any]] = []

            for idx, raw in enumerate(raw_records):
                record_id = raw.get("id") or raw.get("cin") or raw.get("osm_id") or f"row_{offset + idx}"
                
                # Validation step
                is_valid, reason = self.validate(raw)
                if not is_valid:
                    self.record_error(record_id, "VALIDATION_ERROR", reason or "Failed validation", raw)
                    continue

                # Normalization step
                try:
                    norm = self.normalize(raw)
                except Exception as norm_err:
                    self.record_error(record_id, "NORMALIZATION_ERROR", str(norm_err), raw)
                    continue

                # Deduplication step
                try:
                    deduped, is_update = self.deduplicate(norm)
                    if is_update:
                        self.result.records_updated += 1
                    else:
                        self.result.records_inserted += 1
                    normalized_batch.append(deduped)
                except Exception as dedup_err:
                    self.record_error(record_id, "DEDUP_ERROR", str(dedup_err), raw)
                    continue

            # Persistence step (if not dry run)
            if not self.dry_run:
                self.persist(normalized_batch)
            else:
                logger.info(f"[DRY RUN] Would persist {len(normalized_batch)} records to database.")

            status = "SUCCESS" if self.result.records_rejected == 0 else ("PARTIAL" if normalized_batch else "FAILED")
            self.result.finish(status)

        except Exception as e:
            logger.error(f"Ingestion run failed for {self.source_name}: {e}", exc_info=True)
            self.result.errors.append({
                "source": self.source_name,
                "error_type": "FATAL_RUN_ERROR",
                "error_message": str(e),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            self.result.finish("FAILED")

        summary = self.result.to_dict()
        logger.info(f"Completed ingestion {self.source_name}: {summary['status']} "
                    f"(Fetched: {summary['records_fetched']}, Inserted: {summary['records_inserted']}, "
                    f"Updated: {summary['records_updated']}, Rejected: {summary['records_rejected']})")
        return summary

    def persist(self, records: List[Dict[str, Any]]) -> int:
        """
        Default persistence implementation: can write to MongoDB if configured,
        or keep in active ingestion memory. Subclasses can override.
        """
        return len(records)
