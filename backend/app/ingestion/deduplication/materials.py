"""
SYMBIO Material Deduplicator
Maintains canonical material identities without merging different industrial grades or chemical classes.
"""
from typing import Dict, Any, Optional, Tuple

class MaterialDeduplicator:
    def __init__(self):
        self._canonical_index: Dict[Tuple[str, str], str] = {} # (canonical_name, grade) -> material_id

    def register(self, material_id: str, canonical_name: str, quality_grade: Optional[str] = None):
        key = (canonical_name.lower().strip(), (quality_grade or "STANDARD").upper().strip())
        self._canonical_index[key] = material_id

    def find_match(self, canonical_name: str, quality_grade: Optional[str] = None) -> Optional[str]:
        key = (canonical_name.lower().strip(), (quality_grade or "STANDARD").upper().strip())
        return self._canonical_index.get(key)
