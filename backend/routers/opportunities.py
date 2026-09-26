from fastapi import APIRouter, HTTPException
from schemas import OpportunityRequest, OpportunityResponse, UnknownUseRequest, UnknownUseResponse, LoopHunterRequest, LoopHunterResponse
from services.opportunity_engine import opportunity_engine

router = APIRouter(tags=["Opportunities"])

@router.post("/opportunities/discover", response_model=OpportunityResponse)
async def discover_opportunities(request: OpportunityRequest):
    opportunities = opportunity_engine.discover(request)
    
    if not opportunities:
        return OpportunityResponse(
            opportunities=[],
            message="No viable pathway identified."
        )
    
    return OpportunityResponse(
        opportunities=opportunities,
        message="Opportunities discovered successfully."
    )

@router.post("/opportunities/unknown-use", response_model=UnknownUseResponse)
async def discover_unknown_uses(request: UnknownUseRequest):
    opportunities = await opportunity_engine.discover_unknown_uses(request)
    
    if not opportunities:
        return UnknownUseResponse(
            opportunities=[],
            disclaimer="AI-generated opportunities are suggestions, not verified commercial opportunities. No suggestions found."
        )
    
    return UnknownUseResponse(
        opportunities=opportunities,
        disclaimer="AI-generated opportunities are suggestions, not verified commercial opportunities."
    )

@router.post("/opportunities/loop-hunter", response_model=LoopHunterResponse)
async def run_loop_hunter(request: LoopHunterRequest):
    paths = await opportunity_engine.run_loop_hunter(request)
    
    if not paths:
        return LoopHunterResponse(
            paths=[],
            message="No viable multi-hop pathways or loops found."
        )
        
    return LoopHunterResponse(
        paths=paths,
        message="Loop Hunter discovery completed successfully."
    )
