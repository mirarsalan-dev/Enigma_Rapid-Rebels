from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter(tags=["GIS"])

class GISLocation(BaseModel):
    id: str
    name: str
    type: str # 'source', 'receiver', 'processor', 'driver'
    lat: float
    lng: float
    industry: str
    materials_surplus: List[str] = []
    materials_demand: List[str] = []
    processing_capabilities: List[str] = []
    active_exchanges: int = 0

class GISRoute(BaseModel):
    source_id: str
    target_id: str
    material: str
    status: str

@router.get("/gis/locations", response_model=List[GISLocation])
async def get_locations():
    # Mock data based on W2RKG
    return [
        GISLocation(
            id="comp_source_1",
            name="Apex Steel Plant",
            type="source",
            lat=34.0200,
            lng=-118.2000,
            industry="Steel Industry",
            materials_surplus=["Slag", "Steel Scrap"],
            active_exchanges=2
        ),
        GISLocation(
            id="comp_1",
            name="BuildRight Construction",
            type="receiver",
            lat=34.0522,
            lng=-118.2437,
            industry="Construction Industry",
            materials_demand=["Slag", "GBFS", "Concrete", "Construction Material"],
            processing_capabilities=["Grinding", "Crushing"],
            active_exchanges=1
        ),
        GISLocation(
            id="comp_2",
            name="Eco-Cement Corp",
            type="receiver",
            lat=34.1000,
            lng=-118.3000,
            industry="Cement Industry",
            materials_demand=["Ash", "Fly Ash", "Slag", "Limestone"],
            processing_capabilities=["Mixing", "Heating"],
            active_exchanges=0
        ),
        GISLocation(
            id="comp_3",
            name="Green Aggregate Processors",
            type="processor",
            lat=34.2000,
            lng=-118.1000,
            industry="Recycling",
            materials_demand=["Slag", "Rubble", "Brick"],
            materials_surplus=["GBFS", "Aggregate"],
            processing_capabilities=["Granulation", "Sorting"],
            active_exchanges=1
        ),
        GISLocation(
            id="driver_1",
            name="Logistics Unit A",
            type="driver",
            lat=34.0800,
            lng=-118.2500,
            industry="Logistics"
        )
    ]

@router.get("/gis/routes", response_model=List[GISRoute])
async def get_active_routes():
    return [
        GISRoute(source_id="comp_source_1", target_id="comp_3", material="Slag", status="in_transit"),
        GISRoute(source_id="comp_3", target_id="comp_1", material="GBFS", status="planned"),
    ]

@router.get("/gis/hotspots")
async def get_hotspots():
    # Identifies geographic areas where multiple complementary resources/demands exist
    return {
        "hotspots": [
            {
                "id": "hs_1",
                "name": "LA Industrial Corridor",
                "lat": 34.1000,
                "lng": -118.2000,
                "radius_km": 15,
                "complementary_matches": 3,
                "description": "High concentration of steel slag surplus and construction aggregate demand.",
                "disclaimer": "This hotspot shows resource proximity. It is not guaranteed to generate business."
            }
        ]
    }
