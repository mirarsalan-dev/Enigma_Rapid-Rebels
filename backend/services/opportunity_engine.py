import math
from typing import List, Dict, Any
from schemas import OpportunityRequest, Opportunity, UnknownUseRequest, UnknownUseOpportunity, LoopHunterRequest, LoopPath, LoopPathStep
from services.graph_service import get_graph_provider

# Mock potential receivers in the industrial ecosystem (W2RKG - Waste-to-Resource Knowledge Graph)
MOCK_RECEIVERS = [
    {
        "id": "comp_1",
        "name": "BuildRight Construction",
        "accepted_materials": ["Slag", "GBFS", "Concrete", "Construction Material", "Construction Aggregate"],
        "min_quantity": 100.0,
        "max_quantity": 10000.0,
        "lat": 34.0522,
        "lng": -118.2437,
        "processing_capabilities": ["Grinding", "Crushing"],
        "timing_window": ["immediate", "next_month"]
    },
    {
        "id": "comp_2",
        "name": "Eco-Cement Corp",
        "accepted_materials": ["Ash", "Fly Ash", "Slag", "Limestone"],
        "min_quantity": 500.0,
        "max_quantity": 50000.0,
        "lat": 34.1,
        "lng": -118.3,
        "processing_capabilities": ["Mixing", "Heating"],
        "timing_window": ["next_month", "next_quarter"]
    },
    {
        "id": "comp_3",
        "name": "Green Aggregate Processors",
        "accepted_materials": ["Slag", "Rubble", "Brick"],
        "min_quantity": 50.0,
        "max_quantity": 5000.0,
        "lat": 34.2,
        "lng": -118.1,
        "processing_capabilities": ["Granulation", "Sorting"],
        "timing_window": ["immediate"]
    }
]

# W2RKG relationships mapping (semantic similarity and material taxonomy)
W2RKG_RELATIONS = {
    "slag": ["Slag", "GBFS", "Ground Granulated Blast-Furnace Slag", "Construction Material", "Aggregate"],
    "fly ash": ["Ash", "Fly Ash", "Cementitious Material"],
    "concrete": ["Concrete", "Construction Aggregate", "Rubble"],
    "brick": ["Brick", "Rubble", "Construction Aggregate"]
}

def haversine(lat1, lon1, lat2, lon2):
    # Calculate distance in km
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def compute_semantic_similarity(source_material: str, accepted_materials: List[str]) -> float:
    """Simulates semantic similarity and W2RKG lookups instead of simple keyword matching"""
    source_lower = source_material.lower()
    
    # Direct match
    if any(source_lower == m.lower() for m in accepted_materials):
        return 1.0
        
    # Semantic/W2RKG expansion
    expanded_terms = []
    for key, related in W2RKG_RELATIONS.items():
        if key in source_lower or source_lower in key:
            expanded_terms.extend([t.lower() for t in related])
            
    if any(term in [m.lower() for m in accepted_materials] for term in expanded_terms):
        return 0.85 # Strong W2RKG relationship match
        
    # Partial string match as fallback (weak similarity)
    if any(m.lower() in source_lower or source_lower in m.lower() for m in accepted_materials):
        return 0.5
        
    return 0.0

class OpportunityIntelligenceEngine:
    def __init__(self):
        # Configurable Weights
        self.weights = {
            "material_compatibility": 0.20,
            "quantity_compatibility": 0.15,
            "quality_compatibility": 0.10,
            "location": 0.10,
            "timing": 0.10,
            "transportation": 0.10,
            "processing": 0.10,
            "environmental_benefit": 0.15
        }

    def set_weights(self, new_weights: Dict[str, float]):
        """Keep weights configurable dynamically."""
        for k, v in new_weights.items():
            if k in self.weights:
                self.weights[k] = v

    def evaluate_opportunity(self, req: OpportunityRequest, receiver: Dict[str, Any]) -> Opportunity:
        score = 0.0
        explanations = []

        # 1. Material Compatibility (Deterministic Rules + Semantic Similarity + W2RKG)
        mat_name = req.material.material_name or ""
        similarity = compute_semantic_similarity(mat_name, receiver["accepted_materials"])
        
        mat_score = similarity * 100.0
        score += mat_score * self.weights["material_compatibility"]
        
        if similarity >= 0.8:
            explanations.append("✓ Material properties compatible")
            explanations.append("✓ Receiver accepts this material class")
        elif similarity >= 0.5:
            explanations.append("✓ Material partially matches receiver capabilities")

        # 2. Quantity Compatibility
        req_qty = req.quantity_available
        if receiver["min_quantity"] <= req_qty <= receiver["max_quantity"]:
            qty_score = 100.0
            explanations.append("✓ Required quantity available")
        elif req_qty < receiver["min_quantity"]:
            qty_score = (req_qty / receiver["min_quantity"]) * 100
        else:
            qty_score = (receiver["max_quantity"] / req_qty) * 100
        score += qty_score * self.weights["quantity_compatibility"]

        # 3. Quality Compatibility (Using Material DNA)
        # Based on material quality grade / contamination
        qual_grade = req.material.quality_grade or "standard"
        if qual_grade.lower() in ["high", "premium"]:
            qual_score = 100.0
        elif qual_grade.lower() == "standard":
            qual_score = 80.0
        else:
            qual_score = 50.0
        score += qual_score * self.weights["quality_compatibility"]

        # 4. Location & 6. Transportation
        dist_km = 0.0
        if req.location_lat and req.location_lng:
            dist_km = haversine(req.location_lat, req.location_lng, receiver["lat"], receiver["lng"])
            if dist_km <= 150:
                loc_score = 100.0
                trans_score = 100.0
                explanations.append("✓ Transport distance within configured threshold")
            elif dist_km <= 500:
                loc_score = 60.0
                trans_score = 50.0
            else:
                loc_score = 20.0
                trans_score = 10.0
        else:
            loc_score = 50.0
            trans_score = 50.0
            dist_km = 50.0
        
        score += loc_score * self.weights["location"]
        score += trans_score * self.weights["transportation"]

        # 5. Timing
        timing_match = False
        if req.availability_window and req.availability_window.lower() in receiver["timing_window"]:
            timing_score = 100.0
            timing_match = True
            explanations.append("✓ Demand window overlaps supply window")
        else:
            timing_score = 40.0
        score += timing_score * self.weights["timing"]

        # 7. Processing Requirements
        proc_req = req.material.processing_requirements or "None"
        if proc_req == "None" or any(p.lower() in proc_req.lower() for p in receiver["processing_capabilities"]):
            proc_score = 100.0
            explanations.append("✓ Processing capability available")
        else:
            proc_score = 0.0
        score += proc_score * self.weights["processing"]

        # 8. Environmental Benefit
        # Can be derived from Material DNA evidence and properties
        env_score = 90.0 # Deterministic baseline
        if req.material.chemical_properties and "hazardous" in str(req.material.chemical_properties).lower():
            env_score = 50.0 # Less benefit if requires hazardous handling
        elif similarity >= 0.8:
            env_score = 100.0 # Perfect circularity match
        score += env_score * self.weights["environmental_benefit"]
        
        # Viability Checks
        # If material is not compatible at all, the pathway is not viable
        if similarity == 0.0:
            score = 0.0

        # Format explanation
        if explanations:
            explanation_text = "Why this match?\n\n" + "\n".join(explanations)
        else:
            explanation_text = "Match scores are too low to provide specific compatibilities."

        return Opportunity(
            source_company=req.source_company_id or "Unknown Source",
            receiving_company=receiver["name"],
            material=mat_name,
            quantity=req_qty,
            compatibility=mat_score,
            processing_requirement=proc_req,
            distance_km=round(dist_km, 2),
            timing_match=timing_match,
            environmental_estimate="High Carbon Offset Potential",
            opportunity_score=round(score, 2),
            explanation=explanation_text
        )

    def discover(self, req: OpportunityRequest) -> List[Opportunity]:
        opportunities = []
        for receiver in MOCK_RECEIVERS:
            opp = self.evaluate_opportunity(req, receiver)
            # Do not force a match. Threshold to be considered a viable pathway.
            # E.g. score must be reasonably high and material must be compatible.
            if opp.opportunity_score >= 60.0 and opp.compatibility > 0:
                opportunities.append(opp)
        
        # Sort by best score
        opportunities.sort(key=lambda x: x.opportunity_score, reverse=True)
        return opportunities

    async def discover_unknown_uses(self, req: UnknownUseRequest) -> List[UnknownUseOpportunity]:
        """Phase 6: Unknown Use Discovery based on Material DNA."""
        from services.ai_provider import get_ai_provider
        ai_provider = get_ai_provider()
        
        # We simulate semantic embeddings and W2RKG reasoning here via LLM
        opportunities_data = await ai_provider.discover_unknown_uses(req.material.model_dump())
        
        from schemas import UnknownUseOpportunity
        opportunities = []
        for opp in opportunities_data:
            try:
                opportunities.append(UnknownUseOpportunity(**opp))
            except Exception as e:
                print(f"Failed to parse opportunity: {e}")
                
        return opportunities

    async def run_loop_hunter(self, req: LoopHunterRequest) -> List[LoopPath]:
        """Phase 7: Multi-Hop Symbiosis Discovery (Loop Hunter)."""
        graph_provider = get_graph_provider()
        from services.ai_provider import get_ai_provider
        ai_provider = get_ai_provider()
        
        source_id = req.source_company_id
        max_hops = req.max_hops
        
        all_nodes = graph_provider.get_all_nodes()
        other_companies = [n["id"] for n in all_nodes if n.get("type") == "Company" and n["id"] != source_id]
        
        raw_paths = []
        
        # Find paths to other companies
        for target_id in other_companies:
            paths = graph_provider.find_paths(source_id, target_id, max_hops)
            raw_paths.extend(paths)
            
        # Find closed loops containing the source company
        all_loops = graph_provider.find_closed_loops(max_hops)
        for loop in all_loops:
            if any(n["id"] == source_id for n in loop):
                # Ensure the loop starts with the source_id
                start_idx = next(i for i, n in enumerate(loop) if n["id"] == source_id)
                # Rotate the loop so it starts and ends with source_id
                rotated = loop[start_idx:-1] + loop[:start_idx] + [loop[start_idx]]
                raw_paths.append(rotated)
                
        # Limit the number of raw paths to avoid overwhelming the LLM
        # Prioritize loops, then transformation paths, then direct
        raw_paths = raw_paths[:10]
        
        if not raw_paths:
            return []
            
        loop_data_list = await ai_provider.discover_multi_hop_loops(raw_paths)
        
        loop_paths = []
        for data in loop_data_list:
            try:
                loop_paths.append(LoopPath(**data))
            except Exception as e:
                print(f"Failed to parse LoopPath: {e}")
                
        return loop_paths

opportunity_engine = OpportunityIntelligenceEngine()
