from fastapi import APIRouter
from typing import List
import uuid
import httpx
from schemas import DemandCreate, Demand, MarketplaceSearchRequest, MarketplaceMatchResponse, ExternalMatch

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

# In-memory storage for demands for now
mock_demands: List[Demand] = []

@router.post("/demands", response_model=Demand)
async def create_demand(demand: DemandCreate):
    new_demand = Demand(**demand.dict(), demand_id=f"dem_{uuid.uuid4().hex[:8]}")
    mock_demands.append(new_demand)
    return new_demand

@router.get("/demands", response_model=List[Demand])
async def list_demands():
    return mock_demands

@router.post("/match", response_model=MarketplaceMatchResponse)
async def match_opportunities(request: MarketplaceSearchRequest):
    # This simulates the AI match and opportunity discovery for the marketplace
    internal_matches = []
    external_matches = []
    
    # We simulate hitting an external API like SerpApi if internal matches are insufficient.
    # To avoid real API keys in the prompt, we will mock the external company discovery
    # behavior but strictly adhere to the prompt requirements about how it is treated.
    
    query = request.query.lower()
    
    # Mock external search result based on the query
    if "steel" in query or "slag" in query:
        external_matches.append(ExternalMatch(
            company_name="Acme Steel & Processing (External Result)",
            contact_snippet="Found via search: 'Acme Steel specializes in processing industrial slag in the region...'",
            source_url="https://example-search-result.com/acme-steel",
            match_reason="Search engine matched keywords 'steel' and 'slag'."
        ))
    elif "concrete" in query or "cement" in query:
        external_matches.append(ExternalMatch(
            company_name="Regional Cement Aggregates (External Result)",
            contact_snippet="Found via search: 'Supplier of secondary concrete aggregates...'",
            source_url="https://example-search-result.com/regional-cement",
            match_reason="Search engine matched keywords 'concrete' and 'aggregates'."
        ))
    else:
        # Generic external match
        external_matches.append(ExternalMatch(
            company_name="Generic Industrial Processing LLC (External Result)",
            contact_snippet="Found via search: 'Industrial processing and recycling services...'",
            source_url="https://example-search-result.com/generic-processing",
            match_reason="Search engine matched general processing keywords."
        ))

    return MarketplaceMatchResponse(
        internal_matches=internal_matches,
        external_matches=external_matches
    )
