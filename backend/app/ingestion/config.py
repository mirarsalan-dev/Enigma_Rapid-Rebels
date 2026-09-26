"""
SYMBIO Ingestion Engine Configuration
Loads environment variables and sets defaults for external providers and database connections.
"""
import os

class IngestionConfig:
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", os.getenv("MONGODB_DB_NAME", "symbio"))

    # Open Government Data (data.gov.in)
    OGD_BASE_URL = os.getenv("OGD_BASE_URL", "https://api.data.gov.in/resource")
    # Official OGD public demo key from data.gov.in documentation
    OGD_DEMO_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
    OGD_API_KEY = os.getenv("OGD_API_KEY") or OGD_DEMO_API_KEY
    USE_DEMO_API = os.getenv("USE_DEMO_API", "true").lower() in ("true", "1", "yes")
    MCA_RESOURCE_ID = os.getenv("MCA_RESOURCE_ID", "mca-company-master-data")
    UDYAM_RESOURCE_ID = os.getenv("UDYAM_RESOURCE_ID", "udyam-msme-data")

    # Geospatial Services
    OVERPASS_URL = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
    NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")
    OSRM_URL = os.getenv("OSRM_URL", "https://router.project-osrm.org")

    # User Agent for Nominatim & Overpass compliance
    INGESTION_USER_AGENT = os.getenv("INGESTION_USER_AGENT", "SYMBIO-DataIngestion/1.0 (contact@symbio.eco)")

    # Rate limiting & timeouts
    DEFAULT_TIMEOUT_SECONDS = int(os.getenv("INGESTION_TIMEOUT_SECONDS", "8"))
    MAX_RETRIES = int(os.getenv("INGESTION_MAX_RETRIES", "2"))
    RETRY_BACKOFF_FACTOR = float(os.getenv("INGESTION_BACKOFF_FACTOR", "1.2"))

    # Pagination
    DEFAULT_PAGE_SIZE = int(os.getenv("INGESTION_PAGE_SIZE", "500"))
    MAX_PAGES = int(os.getenv("INGESTION_MAX_PAGES", "20"))
