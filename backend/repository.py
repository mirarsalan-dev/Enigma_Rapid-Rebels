from typing import List, Optional
from bson.objectid import ObjectId
from database import companies_collection, materials_collection, waste_listings_collection, exchanges_collection
from schemas import CompanyCreate, Company, MaterialCreate, Material, WasteListingCreate, WasteListing, ExchangeCreate, Exchange

# --- Company Repository ---
async def create_company(company_data: CompanyCreate) -> Company:
    company_dict = company_data.model_dump()
    result = await companies_collection.insert_one(company_dict)
    company_dict["company_id"] = str(result.inserted_id)
    return Company(**company_dict)

async def get_company(company_id: str) -> Optional[Company]:
    company_dict = await companies_collection.find_one({"_id": ObjectId(company_id)})
    if company_dict:
        company_dict["company_id"] = str(company_dict["_id"])
        return Company(**company_dict)
    return None

async def list_companies() -> List[Company]:
    companies = []
    async for company_dict in companies_collection.find():
        company_dict["company_id"] = str(company_dict["_id"])
        companies.append(Company(**company_dict))
    return companies

# --- Material Repository ---
async def create_material(material_data: MaterialCreate) -> Material:
    material_dict = material_data.model_dump()
    result = await materials_collection.insert_one(material_dict)
    material_dict["material_id"] = str(result.inserted_id)
    return Material(**material_dict)

async def get_material(material_id: str) -> Optional[Material]:
    material_dict = await materials_collection.find_one({"_id": ObjectId(material_id)})
    if material_dict:
        material_dict["material_id"] = str(material_dict["_id"])
        return Material(**material_dict)
    return None

async def list_materials() -> List[Material]:
    materials = []
    async for material_dict in materials_collection.find():
        material_dict["material_id"] = str(material_dict["_id"])
        materials.append(Material(**material_dict))
    return materials

# --- Waste Listing Repository ---
async def create_waste_listing(listing_data: WasteListingCreate) -> WasteListing:
    listing_dict = listing_data.model_dump()
    result = await waste_listings_collection.insert_one(listing_dict)
    listing_dict["listing_id"] = str(result.inserted_id)
    return WasteListing(**listing_dict)

async def list_waste_listings() -> List[WasteListing]:
    listings = []
    async for listing_dict in waste_listings_collection.find():
        listing_dict["listing_id"] = str(listing_dict["_id"])
        listings.append(WasteListing(**listing_dict))
    return listings

# --- Exchange Repository ---
async def create_exchange(exchange_data: ExchangeCreate) -> Exchange:
    exchange_dict = exchange_data.model_dump()
    result = await exchanges_collection.insert_one(exchange_dict)
    exchange_dict["exchange_id"] = str(result.inserted_id)
    return Exchange(**exchange_dict)

async def list_exchanges() -> List[Exchange]:
    exchanges = []
    async for exchange_dict in exchanges_collection.find():
        exchange_dict["exchange_id"] = str(exchange_dict["_id"])
        exchanges.append(Exchange(**exchange_dict))
    return exchanges
