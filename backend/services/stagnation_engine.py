from schemas import StagnationAlertRequest, StagnationResponse, StagnationResolution
import uuid

def analyze_stagnation(request: StagnationAlertRequest) -> StagnationResponse:
    stagnant_quantity = request.received_quantity - request.used_quantity
    
    if stagnant_quantity <= 0:
        return StagnationResponse(
            alert_id=str(uuid.uuid4()),
            status="Healthy",
            stagnant_quantity=0.0,
            resolutions=[]
        )
        
    resolutions = []
    
    mat_lower = request.material_name.lower()
    
    # Do not force a match. Evaluate material type to simulate W2RKG resolution.
    if "plastic" in mat_lower or "pet" in mat_lower:
        resolutions.append(StagnationResolution(
            pathway=f"{request.current_holder_id} → C (Recycler)",
            resolution_type="IMMEDIATE MATCH",
            description="Found downstream recycler with active demand.",
            target_companies=["EcoPlast Recycling"]
        ))
    elif "slag" in mat_lower or "concrete" in mat_lower:
        resolutions.append(StagnationResolution(
            pathway=f"{request.current_holder_id} → Processor (Crusher) → D (Cement Kiln)",
            resolution_type="TRANSFORMATION REQUIRED",
            description="Material requires granulation before downstream acceptance.",
            target_companies=["AggreCrush Inc", "BuildRight Cement"]
        ))
    elif "wood" in mat_lower or "organic" in mat_lower:
        resolutions.append(StagnationResolution(
            pathway=f"{request.current_holder_id} → Unknown",
            resolution_type="MARKET DEMAND GAP",
            description="Technical pathway exists (biomass), but no buyers within 500km are currently accepting this volume.",
            target_companies=[]
        ))
    else:
        # Obscure or highly toxic materials with no known pathway
        resolutions.append(StagnationResolution(
            pathway=f"{request.current_holder_id} → ?",
            resolution_type="NO VIABLE PATHWAY IDENTIFIED",
            description="No known technical processing pathway or downstream industry identified in the knowledge graph.",
            target_companies=[]
        ))

    return StagnationResponse(
        alert_id=f"STAG-{str(uuid.uuid4())[:8].upper()}",
        status="Material Stagnation Alert",
        stagnant_quantity=stagnant_quantity,
        resolutions=resolutions
    )
