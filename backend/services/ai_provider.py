import httpx
import json
import os
from abc import ABC, abstractmethod
from typing import Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def extract_material_dna(self, description: str) -> Dict[str, Any]:
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

def get_ai_provider() -> AIProvider:
    return OpenSourceAIProvider()
