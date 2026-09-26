from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Depends
from auth import verify_token
from contextlib import asynccontextmanager

from database import init_db_indexes
from routers import companies, materials, waste_listings, exchanges, ai, graph, opportunities, gis, marketplace, communications, drivers, passports, radar, stagnation, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB indexes
    await init_db_indexes()
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title="SYMBIO API",
    description="AI Industrial Resource Intelligence Network API",
    version="0.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(waste_listings.router, prefix="/api")
app.include_router(exchanges.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(opportunities.router, prefix="/api")
app.include_router(gis.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")
app.include_router(communications.router, prefix="/api")
app.include_router(drivers.router, prefix="/api")
app.include_router(passports.router, prefix="/api")
app.include_router(radar.router, prefix="/api")
app.include_router(stagnation.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthResponse)
async def root():
    return {"status": "ok", "message": "SYMBIO Backend API is running."}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok", "message": "Healthy"}

@app.get("/api/protected")
async def protected_route(user: dict = Depends(verify_token)):
    """
    Example protected route. 
    Only accessible if a valid Firebase ID token is provided in the Authorization header.
    """
    return {
        "message": "Access granted to protected data",
        "user_id": user.get("uid"),
        "email": user.get("email")
    }
