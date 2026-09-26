from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ContactInfo(BaseModel):
    email: str
    phone: Optional[str] = None
    website: Optional[str] = None

class CompanyCreate(BaseModel):
    name: str
    industry: str
    address: str
    latitude: float
    longitude: float
    contact_information: ContactInfo
    capabilities: List[str] = []
    materials_generated: List[str] = []
    materials_consumed: List[str] = []
    verification_status: str = "pending"

class Company(CompanyCreate):
    company_id: str

class MaterialCreate(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    composition: Optional[Dict[str, Any]] = None
    physical_properties: Optional[Dict[str, Any]] = None
    quality_grade: Optional[str] = None
    availability_window: Optional[str] = None
    location: Optional[str] = None
    processing_requirements: Optional[str] = None
    verification_status: str = "pending"

class Material(MaterialCreate):
    material_id: str

class WasteListingCreate(BaseModel):
    producer_id: str
    material_id: str
    quantity: float
    quality: str
    availability: str
    pickup_location: str
    expected_price: Optional[float] = None
    status: str = "active"

class WasteListing(WasteListingCreate):
    listing_id: str

class ExchangeCreate(BaseModel):
    source_company_id: str
    receiving_company_id: str
    material_id: str
    quantity: float
    status: str = "initiated"
    pickup_details: Optional[str] = None
    delivery_details: Optional[str] = None

class Exchange(ExchangeCreate):
    exchange_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MaterialAnalysisRequest(BaseModel):
    description: str

class MaterialDNA(BaseModel):
    material_name: str
    source_industry: Optional[str] = None
    composition: Optional[Dict[str, Any]] = None
    physical_properties: Optional[Dict[str, Any]] = None
    chemical_properties: Optional[Dict[str, Any]] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    quality_grade: Optional[str] = None
    moisture: Optional[str] = None
    contamination_information: Optional[str] = None
    availability_window: Optional[str] = None
    location: Optional[str] = None
    processing_requirements: Optional[str] = None
    possible_applications: List[str] = []
    verification_status: str = "UNVERIFIED" # VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, NEEDS_TESTING
    evidence_source: Optional[str] = None

class MaterialDNAResponse(BaseModel):
    dna: MaterialDNA
    disclaimer: str = "AI analysis is an intelligent classification/compatibility aid. Physical verification requires specifications, test reports, sampling or receiver validation."
