"""
SYMBIO Company Deduplication Logic
Primary match: CIN (Corporate Identification Number).
Fallback match: (normalized_name, registered_state, registered_city).
Ambiguous matches are flagged with duplicate_candidate=True.
"""
from typing import Dict, Any, List, Optional, Tuple

class CompanyDeduplicator:
    def __init__(self):
        # In-memory indexes for dedup tracking during ingestion runs
        self._cin_index: Dict[str, str] = {} # cin -> internal_id
        self._composite_index: Dict[Tuple[str, str, str], str] = {} # (norm_name, state, city) -> internal_id

    def register(self, company_id: str, cin: Optional[str], norm_name: str, state: Optional[str], city: Optional[str]):
        if cin:
            self._cin_index[cin.upper().strip()] = company_id

        comp_key = (
            norm_name.upper().strip() if norm_name else "",
            (state or "").upper().strip(),
            (city or "").upper().strip()
        )
        if norm_name:
            self._composite_index[comp_key] = company_id

    def find_match(
        self,
        cin: Optional[str],
        normalized_name: str,
        registered_state: Optional[str] = None,
        registered_city: Optional[str] = None
    ) -> Tuple[Optional[str], float, bool]:
        """
        Returns (matched_company_id, confidence, is_duplicate_candidate)
        - High confidence (1.0): CIN exact match.
        - Moderate confidence (0.85): Normalized name + exact state + exact city match.
        - Candidate / Uncertain (0.50): Same normalized name across different city/state (flags duplicate_candidate=True).
        - No match: (None, 0.0, False)
        """
        # 1. Exact CIN match
        if cin and cin.strip():
            cin_clean = cin.strip().upper()
            if cin_clean in self._cin_index:
                return self._cin_index[cin_clean], 1.0, False

        # 2. Composite match (normalized name + state + city)
        if normalized_name:
            comp_key = (
                normalized_name.upper().strip(),
                (registered_state or "").upper().strip(),
                (registered_city or "").upper().strip()
            )
            if comp_key in self._composite_index:
                return self._composite_index[comp_key], 0.85, False

            # Check if name exists in index with different city/state
            for (idx_name, _, _), existing_id in self._composite_index.items():
                if idx_name == normalized_name.upper().strip():
                    # Flag as candidate for human/admin review, do NOT automatically merge
                    return existing_id, 0.50, True

        return None, 0.0, False
