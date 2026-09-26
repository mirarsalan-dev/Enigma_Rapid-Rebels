import httpx
import json
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIProvider(ABC):
    @abstractmethod
    async def extract_material_dna(self, description: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def discover_unknown_uses(self, material_dna: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def discover_multi_hop_loops(self, raw_paths: List[Any]) -> List[Dict[str, Any]]:
        pass

class OpenSourceAIProvider(AIProvider):
    def __init__(self):
        # We assume an open-source model running on Ollama locally or HuggingFace
        self.api_url = os.environ.get("OPEN_SOURCE_AI_URL", "http://localhost:11434/api/generate")
        self.model = os.environ.get("OPEN_SOURCE_AI_MODEL", "llama3")

    async def extract_material_dna(self, description: str) -> Dict[str, Any]:
        prompt = f"""
Extract the following information from the industrial material description to form its 'Material DNA'.
Respond ONLY with a valid JSON object. Do not include markdown formatting like ```json.
The JSON should have these keys (use null for unknown values):
- material_name (string, required)
- source_industry (string)
- composition (object)
- physical_properties (object)
- chemical_properties (object)
- quantity (number)
- unit (string)
- quality_grade (string)
- moisture (string)
- contamination_information (string)
- availability_window (string)
- location (string)
- processing_requirements (string)
- possible_applications (array of strings)

IMPORTANT:
- Do NOT claim physical safety or regulatory compliance.
- Verification status must be one of: VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, NEEDS_TESTING.
- The default verification status for AI extracted data is UNVERIFIED.

Description:
"{description}"

JSON:
"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    },
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
                result_text = data.get("response", "{}")
                parsed = json.loads(result_text)
                parsed["verification_status"] = "UNVERIFIED"
                return parsed
        except Exception as e:
            # Fallback to structured parsing heuristics or mock if API is unavailable
            print(f"AI Provider error: {e}. Falling back to basic extraction.")
            return self._fallback_extraction(description)

    def _fallback_extraction(self, description: str) -> Dict[str, Any]:
        # Do not hardcode material-specific results. Provide a generic fallback structure.
        return {
            "material_name": "Unidentified Material (AI unavailable)",
            "source_industry": None,
            "quantity": None,
            "unit": None,
            "possible_applications": [],
            "verification_status": "UNVERIFIED"
        }

    async def discover_unknown_uses(self, material_dna: Dict[str, Any]) -> List[Dict[str, Any]]:
        prompt = f"""
Given the following Material DNA for an industrial waste or by-product, identify potential unknown or alternative applications even if no direct buyer currently exists. 
Use concepts like Waste-to-Resource Knowledge Graph (W2RKG), semantic embeddings, material properties, industrial applications, and processing relationships.

Generate 2-3 potential processing opportunities.
Respond ONLY with a valid JSON array of objects. Do not include markdown formatting like ```json.
Each object MUST have these exact keys:
- "material": string (The name of the material)
- "required_process": string (What needs to be done to it)
- "potential_output": string (What it becomes)
- "potential_industries": array of strings
- "potential_downstream_users": string (e.g. "Local Energy Grids", "Construction firms")
- "estimated_logistics_complexity": string (e.g. "Low", "Medium", "High" with optional short explanation)
- "estimated_environmental_opportunity": string (e.g. "High Carbon Offset")
- "category": string (One of: "Direct applications", "Indirect applications", "Applications requiring transformation", "Potential processing businesses", "Potential new industrial infrastructure")
- "description": string (Must be exactly "Potential processing opportunity")

Material DNA:
{json.dumps(material_dna, indent=2)}

JSON Array:
"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    },
                    timeout=20.0
                )
                response.raise_for_status()
                data = response.json()
                result_text = data.get("response", "[]")
                parsed = json.loads(result_text)
                return parsed if isinstance(parsed, list) else []
        except Exception as e:
            print(f"AI Provider error for unknown uses: {e}. Falling back to mock data.")
            return self._fallback_unknown_uses(material_dna)

    def _fallback_unknown_uses(self, material_dna: Dict[str, Any]) -> List[Dict[str, Any]]:
        mat_name = material_dna.get("material_name", "Unknown Material")
        return [
            {
                "material": mat_name,
                "required_process": "Thermal Treatment / Pyrolysis",
                "potential_output": "Syngas / Biochar / Recovered Minerals",
                "potential_industries": ["Energy", "Agriculture", "Manufacturing"],
                "potential_downstream_users": "Local Energy Grids, Farms",
                "estimated_logistics_complexity": "High",
                "estimated_environmental_opportunity": "High Waste-to-Energy Value",
                "category": "Potential processing businesses",
                "description": "Potential processing opportunity"
            }
        ]

    async def discover_multi_hop_loops(self, raw_paths: List[Any]) -> List[Dict[str, Any]]:
        if not raw_paths:
            return []
            
        prompt = f"""
You are the LOOP HUNTER engine for an industrial symbiosis platform.
I will provide you with raw path data extracted from the Waste-to-Resource Knowledge Graph (W2RKG).
Your task is to evaluate these raw paths, calculate key metrics, and format them into LoopPath objects.

Rules:
- DO NOT create fictional companies. Only use the nodes provided.
- The pathway_type must be one of: "DIRECT EXCHANGE", "MULTI-HOP EXCHANGE", "CLOSED LOOP", "TRANSFORMATION REQUIRED", "NO VIABLE PATHWAY IDENTIFIED".
- Calculate number_of_hops (number of edges).
- Extract materials_exchanged, processing_steps, and companies_involved from the nodes.
- Estimate transportation_requirements, timing_constraints, estimated_environmental_benefit, and estimated_economic_opportunity based on the industries and processes involved.

Return ONLY a valid JSON array of objects. Do not include markdown formatting like ```json.
Each object must have exactly these keys:
- pathway_type (string)
- number_of_hops (integer)
- materials_exchanged (array of strings)
- processing_steps (array of strings)
- companies_involved (array of strings)
- transportation_requirements (string)
- timing_constraints (string)
- estimated_environmental_benefit (string)
- estimated_economic_opportunity (string)
- steps (array of objects with keys: node_id, node_type, node_name, relationship_to_next)

Raw Paths:
{json.dumps(raw_paths, indent=2)}

JSON Array:
"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    },
                    timeout=25.0
                )
                response.raise_for_status()
                data = response.json()
                result_text = data.get("response", "[]")
                parsed = json.loads(result_text)
                return parsed if isinstance(parsed, list) else []
        except Exception as e:
            print(f"AI Provider error for multi-hop loops: {e}. Returning raw mappings.")
            return self._fallback_multi_hop(raw_paths)

    def _fallback_multi_hop(self, raw_paths: List[Any]) -> List[Dict[str, Any]]:
        loops = []
        for path in raw_paths:
            hops = len(path) - 1
            companies = [n["properties"].get("name", n["id"]) for n in path if n.get("type") == "Company"]
            materials = [n["properties"].get("name", n["id"]) for n in path if n.get("type") == "Material"]
            processes = [n["properties"].get("name", n["id"]) for n in path if n.get("type") == "Process"]
            
            pathway_type = "MULTI-HOP EXCHANGE"
            if hops == 1:
                pathway_type = "DIRECT EXCHANGE"
            if len(processes) > 0:
                pathway_type = "TRANSFORMATION REQUIRED"
            if len(path) > 1 and path[0]["id"] == path[-1]["id"]:
                pathway_type = "CLOSED LOOP"
                
            steps = []
            for i, n in enumerate(path):
                rel = None
                if i < len(path) - 1:
                    edge = n.get("edge_to_next", {})
                    rel = edge.get("relationship", "unknown") if isinstance(edge, dict) else str(edge)
                steps.append({
                    "node_id": n["id"],
                    "node_type": n.get("type", "unknown"),
                    "node_name": n["properties"].get("name", n["id"]),
                    "relationship_to_next": rel
                })
                
            loops.append({
                "pathway_type": pathway_type,
                "number_of_hops": hops,
                "materials_exchanged": materials,
                "processing_steps": processes,
                "companies_involved": companies,
                "transportation_requirements": "Standard industrial logistics",
                "timing_constraints": "Coordinate based on generation rates",
                "estimated_environmental_benefit": "Waste diversion from landfill",
                "estimated_economic_opportunity": "Cost savings on raw materials",
                "steps": steps
            })
        return loops

def get_ai_provider() -> AIProvider:
    return OpenSourceAIProvider()
