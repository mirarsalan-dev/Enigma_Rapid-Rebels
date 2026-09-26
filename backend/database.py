from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "symbio_db")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

# Collections
companies_collection = db.get_collection("companies")
users_collection = db.get_collection("users")
materials_collection = db.get_collection("materials")
material_profiles_collection = db.get_collection("material_profiles")
waste_listings_collection = db.get_collection("waste_listings")
opportunities_collection = db.get_collection("opportunities")
exchanges_collection = db.get_collection("exchanges")
appointments_collection = db.get_collection("appointments")
drivers_collection = db.get_collection("drivers")
trips_collection = db.get_collection("trips")
feedback_collection = db.get_collection("feedback")
material_passports_collection = db.get_collection("material_passports")
notifications_collection = db.get_collection("notifications")

async def init_db_indexes():
    # Indexes for frequently searched fields
    # Company Location (GeoJSON 2dsphere for accurate geo-queries, but we'll use a basic index here for lat/lon for simplicity or 2dsphere if we had a GeoJSON object)
    await companies_collection.create_index([("latitude", 1), ("longitude", 1)])
    
    # Industry
    await companies_collection.create_index("industry")
    
    # Material category
    await materials_collection.create_index("category")
    
    # Availability
    await waste_listings_collection.create_index("availability")
    
    # Exchange status
    await exchanges_collection.create_index("status")
    
    print("Database indexes initialized successfully.")
