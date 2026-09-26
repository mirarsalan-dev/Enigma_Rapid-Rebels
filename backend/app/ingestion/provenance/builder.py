"""
SYMBIO Data Provenance Builder
Ensures every external and generated record preserves lineage, source details, quality status, and freshness.
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any

VALID_STATUSES = {
    "OBSERVED",
    "VERIFIED",
    "USER_PROVIDED",
    "AI_SUGGESTED",
    "EXTERNALLY_DISCOVERED",
    "MODELLED",
    "NEEDS_TESTING",
    "UNVERIFIED"
}

VALID_FRESHNESS = {
    "LIVE",
    "RECENT",
    "DAILY",
    "PERIODIC",
    "HISTORICAL"
}

class ProvenanceBuilder:
    @staticmethod
    def build(
        source_name: str,
        source_record_id: Optional[str] = None,
        source_url: Optional[str] = None,
        status: str = "OBSERVED",
        freshness: str = "PERIODIC",
        confidence: float = 1.0,
        license_name: Optional[str] = "Open Government Data License - India (OGDL)",
        published_at: Optional[str] = None,
        observed_at: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Builds a canonical provenance object.
        """
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{status}'. Must be one of {VALID_STATUSES}")
        if freshness not in VALID_FRESHNESS:
            raise ValueError(f"Invalid freshness '{freshness}'. Must be one of {VALID_FRESHNESS}")

        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "source_name": source_name,
            "source_record_id": str(source_record_id) if source_record_id is not None else None,
            "source_url": source_url,
            "status": status,
            "freshness": freshness,
            "confidence": min(max(float(confidence), 0.0), 1.0),
            "license": license_name,
            "retrieved_at": now_iso,
            "published_at": published_at or now_iso,
            "observed_at": observed_at or now_iso,
            "metadata": metadata or {}
        }
