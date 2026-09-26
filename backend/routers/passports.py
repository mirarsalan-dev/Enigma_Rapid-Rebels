from fastapi import APIRouter, HTTPException
from schemas import MaterialPassport, PassportDataPoint, CustodyStep
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/passports",
    tags=["Material Passports"]
)

# Mocked data for demo
@router.get("/{passport_id}", response_model=MaterialPassport)
async def get_passport(passport_id: str):
    return MaterialPassport(
        passport_id=passport_id,
        material=PassportDataPoint(value="Recycled High-Density Polyethylene (HDPE)", source_type="VERIFIED"),
        source_company=PassportDataPoint(value="EcoPlastics Recycling Inc.", source_type="USER_PROVIDED"),
        batch=PassportDataPoint(value="B-2026-09A", source_type="AI_GENERATED"),
        quantity=PassportDataPoint(value="5,000 kg", source_type="USER_PROVIDED"),
        composition=PassportDataPoint(value="98% HDPE, 2% colorants", source_type="TEST_CERTIFICATE"),
        quality=PassportDataPoint(value="Grade A Industrial", source_type="TEST_CERTIFICATE"),
        test_status=PassportDataPoint(value="Passed ISO-14001 Standards", source_type="VERIFIED"),
        origin=PassportDataPoint(value="Detroit, MI Facility", source_type="USER_PROVIDED"),
        destination=PassportDataPoint(value="Advanced Molding Corp, Ohio", source_type="AI_GENERATED"),
        processing_history=[
            PassportDataPoint(value="Washed and sorted", source_type="VERIFIED"),
            PassportDataPoint(value="Extruded into pellets", source_type="USER_PROVIDED")
        ],
        exchange_history=[
            PassportDataPoint(value="Sourced from Municipal Waste Stream via Symbio Exchange", source_type="AI_GENERATED")
        ],
        chain_of_custody=[
            CustodyStep(step_type="SOURCE", entity_name="EcoPlastics Recycling Inc.", timestamp="2026-09-20T08:00:00Z", location="Detroit, MI"),
            CustodyStep(step_type="PICKUP", entity_name="SYMBIO Logistics (Truck-A12)", timestamp="2026-09-21T10:30:00Z", location="Detroit, MI"),
            CustodyStep(step_type="PROCESSOR", entity_name="Symbio Regional Hub", timestamp="2026-09-22T14:15:00Z", location="Toledo, OH", notes="Quality check passed"),
            CustodyStep(step_type="RECEIVER", entity_name="Advanced Molding Corp", timestamp="2026-09-24T09:00:00Z", location="Cleveland, OH"),
            CustodyStep(step_type="DOWNSTREAM_USE", entity_name="Automotive Part Manufacturing", timestamp="2026-09-25T11:00:00Z", location="Cleveland, OH", notes="Integrated into dashboard panels")
        ],
        created_at="2026-09-20T08:00:00Z",
        updated_at=datetime.utcnow().isoformat() + "Z"
    )
