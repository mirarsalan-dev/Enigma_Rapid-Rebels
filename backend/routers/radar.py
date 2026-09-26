from fastapi import APIRouter, HTTPException
from schemas import ForecastResponse
from pydantic import BaseModel
from services.forecasting_engine import generate_forecast

router = APIRouter(tags=["Future Radar"])

class ForecastRequest(BaseModel):
    material_name: str

@router.post("/radar/forecast", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    try:
        return await generate_forecast(request.material_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
