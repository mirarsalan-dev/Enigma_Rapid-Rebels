from fastapi import APIRouter, HTTPException
from schemas import OpportunityRequest, OpportunityResponse
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
