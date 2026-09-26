from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from schemas import DriverEventSyncRequest, Trip, DriverEvent
from database import trips_collection, db
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"]
)

# Mocked initial trip for demonstration
@router.get("/trips/{driver_id}", response_model=List[Trip])
async def get_driver_trips(driver_id: str):
    # In a real app, we would query the database
    # For demo, return a mock trip if none exist
    trips = []
    async for trip in trips_collection.find({"driver_id": driver_id}):
        trip["trip_id"] = str(trip["_id"])
        trips.append(Trip(**trip))
    
    if not trips:
        mock_trip = Trip(
            trip_id=f"trip_{uuid.uuid4().hex[:8]}",
            driver_id=driver_id,
            exchange_id=f"exch_{uuid.uuid4().hex[:8]}",
            pickup_location="123 Supplier Industrial Park, City",
            destination="456 Seeker Facility, City",
            material="Recycled Copper Wire",
            status="PENDING"
        )
        return [mock_trip]
    
    return trips

@router.post("/sync")
async def sync_offline_events(request: DriverEventSyncRequest):
    """
    Receives a batch of offline events from the driver app.
    These events are processed and saved to the database.
    """
    events_processed = 0
    errors = []
    
    driver_events_collection = db.get_collection("driver_events")
    
    for event in request.events:
        try:
            # Upsert based on event_id to prevent duplicates
            event_dict = event.dict()
            event_dict["sync_status"] = "SYNCED"
            event_dict["server_timestamp"] = datetime.utcnow()
            
            await driver_events_collection.update_one(
                {"event_id": event.event_id},
                {"$set": event_dict},
                upsert=True
            )
            events_processed += 1
            
            # Additional processing based on event_type (e.g., updating Trip status)
            if event.event_type == "START_TRIP":
                pass
            elif event.event_type == "RECORD_PICKUP":
                pass
            elif event.event_type == "RECORD_DELIVERY":
                pass
            elif event.event_type == "ADD_NOTES":
                pass
            elif event.event_type == "GPS_LOCATION":
                pass
                
        except Exception as e:
            errors.append({"event_id": event.event_id, "error": str(e)})

    return {
        "status": "success", 
        "processed": events_processed,
        "failed": len(errors),
        "errors": errors
    }
