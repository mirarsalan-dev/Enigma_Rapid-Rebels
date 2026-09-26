from fastapi import APIRouter
from schemas import StagnationAlertRequest, StagnationResponse
from services.stagnation_engine import analyze_stagnation

router = APIRouter(tags=["Stagnation Intelligence"])

@router.post("/stagnation/analyze", response_model=StagnationResponse)
async def analyze_material_stagnation(request: StagnationAlertRequest):
    return analyze_stagnation(request)
