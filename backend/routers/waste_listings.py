from fastapi import APIRouter
from typing import List
import repository
from schemas import WasteListingCreate, WasteListing

router = APIRouter(prefix="/waste-listings", tags=["Waste Listings"])

@router.post("/", response_model=WasteListing)
async def create_listing_endpoint(listing: WasteListingCreate):
    return await repository.create_waste_listing(listing)

@router.get("/", response_model=List[WasteListing])
async def list_listings_endpoint():
    return await repository.list_waste_listings()
