from fastapi import APIRouter, HTTPException
from typing import List
import repository
from schemas import CompanyCreate, Company

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("/", response_model=Company)
async def create_company_endpoint(company: CompanyCreate):
    return await repository.create_company(company)

@router.get("/", response_model=List[Company])
async def list_companies_endpoint():
    return await repository.list_companies()

@router.get("/{company_id}", response_model=Company)
async def get_company_endpoint(company_id: str):
    company = await repository.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
