from fastapi import APIRouter
from typing import List
import repository
from schemas import ExchangeCreate, Exchange

router = APIRouter(prefix="/exchanges", tags=["Exchanges"])

@router.post("/", response_model=Exchange)
async def create_exchange_endpoint(exchange: ExchangeCreate):
    return await repository.create_exchange(exchange)

@router.get("/", response_model=List[Exchange])
async def list_exchanges_endpoint():
    return await repository.list_exchanges()
