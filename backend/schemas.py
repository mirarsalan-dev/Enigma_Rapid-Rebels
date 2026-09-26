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

class OpportunityRequest(BaseModel):
    source_company_id: Optional[str] = None
    material: MaterialDNA
    quantity_available: float
    availability_window: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class Opportunity(BaseModel):
    source_company: str
    receiving_company: str
    material: str
    quantity: float
    compatibility: float
    processing_requirement: Optional[str] = None
    distance_km: float
    timing_match: bool
    environmental_estimate: str
    opportunity_score: float
    explanation: str

class OpportunityResponse(BaseModel):
    opportunities: List[Opportunity]
    message: str = "Opportunities discovered successfully."

class UnknownUseRequest(BaseModel):
    material: MaterialDNA

class UnknownUseOpportunity(BaseModel):
    material: str
    required_process: str
    potential_output: str
    potential_industries: List[str]
    potential_downstream_users: str
    estimated_logistics_complexity: str
    estimated_environmental_opportunity: str
    category: str
    description: str

class UnknownUseResponse(BaseModel):
    opportunities: List[UnknownUseOpportunity]
    disclaimer: str = "AI-generated opportunities are suggestions, not verified commercial opportunities."

class LoopHunterRequest(BaseModel):
    source_company_id: str
    max_hops: int = 5

class LoopPathStep(BaseModel):
    node_id: str
    node_type: str
    node_name: str
    relationship_to_next: Optional[str] = None

class LoopPath(BaseModel):
    pathway_type: str
    number_of_hops: int
    materials_exchanged: List[str]
    processing_steps: List[str]
    companies_involved: List[str]
    transportation_requirements: str
    timing_constraints: str
    estimated_environmental_benefit: str
    estimated_economic_opportunity: str
    steps: List[LoopPathStep]

class LoopHunterResponse(BaseModel):
    paths: List[LoopPath]
    message: str = "Loop Hunter discovery completed."

class DemandCreate(BaseModel):
    seeker_id: str
    material_requirements: str
    quantity: float
    quality: str
    location: str
    time_window: str
    status: str = "active"

class Demand(DemandCreate):
    demand_id: str

class MarketplaceSearchRequest(BaseModel):
    query: str
    type: str # 'supply' or 'demand'
    filters: Optional[Dict[str, Any]] = None

class ExternalMatch(BaseModel):
    company_name: str
    contact_snippet: str
    source_url: str
    match_reason: str
    verification_status: str = "Potentially discoverable company"
    disclaimer: str = "This is an external search result and NOT a verified SYMBIO partner."

class MarketplaceMatchResponse(BaseModel):
    internal_matches: List[Any]
    external_matches: List[ExternalMatch]

class CommunicationMessage(BaseModel):
    sender: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AppointmentCreate(BaseModel):
    exchange_id: str
    source: str
    receiver: str
    date: str
    time: str
    location: str
    status: str = "pending"

class Appointment(AppointmentCreate):
    appointment_id: str
    communication_history: List[CommunicationMessage] = []


