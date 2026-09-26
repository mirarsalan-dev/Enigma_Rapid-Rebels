from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="SYMBIO API",
    description="AI Industrial Resource Intelligence Network API",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthResponse)
async def root():
    return {"status": "ok", "message": "SYMBIO Backend API is running."}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok", "message": "Healthy"}
