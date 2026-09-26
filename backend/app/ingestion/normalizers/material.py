"""
SYMBIO Material Normalizer
Performs deterministic normalization using an industrial alias dictionary,
canonical classification, and standard property structures without fabricating data.
"""
import re
from typing import Dict, Any, Optional

# Known industrial material mappings
CANONICAL_MATERIAL_CATALOG = {
    "blast_furnace_slag": {
        "canonical_name": "Blast Furnace Slag",
        "material_class": "Mineral Byproduct",
        "aliases": ["slag", "bf slag", "iron slag", "air-cooled slag", "blast furnace slag"],
        "source_industries": ["Steel Industry", "Metallurgy"],
        "potential_applications": ["Road Sub-base", "Concrete Aggregate", "Cement Manufacturing"],
        "processing_requirements": "Crushing, screening, or water granulation"
    },
    "gbfs": {
        "canonical_name": "Granulated Blast Furnace Slag (GBFS)",
        "material_class": "Supplementary Cementitious",
        "aliases": ["gbfs", "ggbfs", "ground granulated blast-furnace slag", "granulated slag"],
        "source_industries": ["Steel Industry", "Slag Processing"],
        "potential_applications": ["Green Cement", "Ready-Mix Concrete", "Geopolymers"],
        "processing_requirements": "Fine grinding in ball/vertical roller mill"
    },
    "fly_ash": {
        "canonical_name": "Coal Fly Ash",
        "material_class": "Supplementary Cementitious",
        "aliases": ["fly ash", "pulverized fuel ash", "pfa", "coal ash", "thermal ash"],
        "source_industries": ["Thermal Power", "Energy Generation"],
        "potential_applications": ["Portland Pozzolana Cement", "Fly Ash Bricks", "Embankment Fill"],
        "processing_requirements": "Dry pneumatic collection, classification"
    },
    "hdpe_scrap": {
        "canonical_name": "High-Density Polyethylene (HDPE) Scrap",
        "material_class": "Secondary Polymer",
        "aliases": ["hdpe", "recycled hdpe", "hdpe flakes", "pe-hd", "hdpe regrind"],
        "source_industries": ["Plastic Manufacturing", "Packaging", "Recycling"],
        "potential_applications": ["Corrugated Drainage Pipe", "Plastic Pallets", "Extruded Lumber"],
        "processing_requirements": "Optical sorting, shredding, hot washing, extrusion pelletizing"
    },
    "steel_scrap": {
        "canonical_name": "Ferrous Steel Scrap",
        "material_class": "Metal Byproduct",
        "aliases": ["steel scrap", "rebar offcuts", "mill scale", "shredded scrap", "iron scrap"],
        "source_industries": ["Construction Industry", "Automotive", "Metal Fabrication"],
        "potential_applications": ["Electric Arc Furnace Steelmaking", "Foundry Casting"],
        "processing_requirements": "Shearing, baling, magnetic separation"
    },
    "chemical_gypsum": {
        "canonical_name": "Phosphogypsum / Chemical Gypsum",
        "material_class": "Chemical Byproduct",
        "aliases": ["phosphogypsum", "flue gas desulfurization gypsum", "fgd gypsum", "synthetic gypsum"],
        "source_industries": ["Fertilizer Industry", "Power Generation"],
        "potential_applications": ["Cement Retarder", "Plasterboard", "Soil Conditioning"],
        "processing_requirements": "Neutralization, dewatering, washing"
    },
    "spent_foundry_sand": {
        "canonical_name": "Spent Foundry Sand",
        "material_class": "Mineral Byproduct",
        "aliases": ["foundry sand", "waste foundry sand", "casting sand"],
        "source_industries": ["Foundry", "Metal Casting"],
        "potential_applications": ["Asphalt Pavement", "Flowable Fill", "Manufactured Soil"],
        "processing_requirements": "Magnetic separation for residual iron, sieving"
    },
    "hazardous_spent_solvent": {
        "canonical_name": "Spent Organic Solvents",
        "material_class": "Hazardous Waste",
        "aliases": ["spent solvent", "waste solvent", "chlorinated solvents", "mixed spent solvent"],
        "source_industries": ["Pharmaceutical", "Chemical Manufacturing", "Paints & Coatings"],
        "potential_applications": ["Solvent Distillation Recovery", "Cement Kiln Co-processing"],
        "processing_requirements": "Fractional vacuum distillation, thermal oxidizer abatement"
    }
}

def normalize_material_name(raw_name: str) -> Dict[str, Any]:
    """
    Normalizes a material name deterministically.
    Returns canonical information, matching aliases, and classifications.
    Crucial: Properties not observed or known are kept as None/empty, never fabricated.
    """
    if not raw_name or not isinstance(raw_name, str):
        return {
            "canonical_name": "Unclassified Industrial Residue",
            "material_class": "Other Industrial Waste",
            "aliases": [],
            "source_industries": [],
            "potential_applications": [],
            "processing_requirements": None,
            "raw_name": raw_name or ""
        }

    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', raw_name.lower())
    tokens = set(cleaned.split())

    best_match = None
    best_score = 0

    for key, spec in CANONICAL_MATERIAL_CATALOG.items():
        for alias in spec["aliases"]:
            alias_tokens = set(alias.lower().split())
            if alias_tokens.issubset(tokens):
                score = len(alias_tokens)
                if score > best_score:
                    best_score = score
                    best_match = spec

    if best_match:
        return {
            "canonical_name": best_match["canonical_name"],
            "material_class": best_match["material_class"],
            "aliases": list(best_match["aliases"]),
            "source_industries": list(best_match["source_industries"]),
            "potential_applications": list(best_match["potential_applications"]),
            "processing_requirements": best_match["processing_requirements"],
            "raw_name": raw_name.strip()
        }

    # Fallback to sanitized title-case name
    sanitized = " ".join(raw_name.strip().split())
    return {
        "canonical_name": sanitized.title(),
        "material_class": "Industrial Byproduct",
        "aliases": [raw_name.strip()],
        "source_industries": [],
        "potential_applications": [],
        "processing_requirements": None,
        "raw_name": raw_name.strip()
    }
