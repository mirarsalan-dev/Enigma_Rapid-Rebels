"""
SYMBIO Company Name Normalizer
Safely normalizes corporate names and removes legal suffixes without destroying distinctive words.
"""
import re
from typing import Tuple

# Common legal suffixes in India and internationally
LEGAL_SUFFIXES = [
    r'PRIVATE\s+LIMITED',
    r'PVT\.?\s*LTD\.?',
    r'PVT',
    r'LIMITED',
    r'LTD\.?',
    r'LLP',
    r'LIMITED\s+LIABILITY\s+PARTNERSHIP',
    r'INC\.?',
    r'INCORPORATED',
    r'CORP\.?',
    r'CORPORATION',
    r'CO\.?',
    r'COMPANY',
]

def normalize_company_name(name: str) -> Tuple[str, str]:
    """
    Normalizes a company name by:
    1. Trimming leading/trailing whitespace
    2. Collapsing multiple spaces
    3. Stripping known legal suffixes from the end of the name
    4. Removing extraneous trailing punctuation (.,-,/)
    Returns: (normalized_name, original_name)
    """
    if not name or not isinstance(name, str):
        return "", ""

    original_name = name.strip()
    norm = original_name.upper()

    # Standardize common brackets or punctuation
    norm = re.sub(r'[\(\)\[\]\{\}]', ' ', norm)
    norm = re.sub(r'[,;]', ' ', norm)
    norm = re.sub(r'\s+', ' ', norm).strip()

    # Repeatedly strip legal suffixes that occur towards the end
    modified = True
    while modified:
        modified = False
        # Clean trailing dots/dashes first
        norm = re.sub(r'[\s\-._/]+$', '', norm).strip()
        for pat in LEGAL_SUFFIXES:
            # Match boundary before suffix, and optional trailing dot at end of string
            pattern = rf'(?:^|\b){pat}\.?$'
            match = re.search(pattern, norm, re.IGNORECASE)
            if match:
                norm = norm[:match.start()].strip()
                modified = True
                break

    # Strip any dangling punctuation from the end (e.g. "Apex Steel -")
    norm = re.sub(r'[\s\-._/]+$', '', norm).strip()

    # If removing suffixes emptied the name, revert to original
    if not norm:
        norm = original_name.upper().strip()

    return norm, original_name
