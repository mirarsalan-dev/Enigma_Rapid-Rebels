# Enigma_Symbio

**SYMBIO — AI Industrial Resource Intelligence Network**

## Problem Statement
Discovering Hidden Industrial Symbiosis.

## Phase 1 Implementation

- **Landing Page:** Explains industrial waste/resource exchange, hidden industrial symbiosis, AI-powered resource discovery, and circular economy. Includes "Enter SYMBIO" CTA.
- **Authentication:** Firebase Email/Password Authentication. Backend uses Firebase Admin SDK to verify ID tokens.
- **Dashboard Layout:** A reusable application layout with protected routes. Unauthenticated users are redirected to login.
- **Navigation:** Overview, Industrial Map, Resources, Opportunities, Marketplace, Exchanges, Logistics, Analytics, Industrial Dashboard, Material Passport, AI Advisor, Settings.

## Phase 2 Implementation

- **Database Layer (MongoDB):** Centralized resource definitions (Company, Material, Waste Listing, Exchange).
- **Core APIs:** CRUD operations via FastAPI for resources, material discovery, and industrial exchanges.

## Phase 3 Implementation

- **AI Integration (Gemini/OpenAI):** AI Material Analysis endpoint to parse waste descriptions into structured physical/chemical properties, handling hazards and industrial compliance automatically.
- **Frontend Dashboard:** Connected Material Analysis UI to real-time AI suggestions for safe repurposing of industrial waste.

## Phase 4 Implementation

- **W2RKG (Waste-to-Resource Knowledge Graph):** Industrial ecosystem mapped as an N-hop graph structure (using NetworkX, architected for Neo4j).
- **Path Discovery:** Capable of finding AI-suggested cross-industry supply chain connections (e.g., Steel Plant -> Slag -> Granulator -> Construction).
- **Circular Economy Loop Detection:** Automatically finds closed loops in the material ecosystem.
- **Visualizer:** Interactive SVG/React visualization component in the frontend to explore the knowledge graph.

## Phases 5 to 17 Implementation Highlights

- **Opportunity Engine & Geographic Search (Phases 5-7):** Matchmaking engine scoring exchanges by volume and chemical match. Industrial Geographic System (GIS) utilizing OSRM and Leaflet for geospatial routing and distance optimization.
- **Marketplace & Communications (Phases 8-10):** Real-time bidding system, automated contract generation, and integrated Twilio SMS notifications for supply chain partners.
- **SYMBIO Driver Logistics (Phases 11-12):** Offline-first driver application using SQLite and syncing queues. Live Logistics Tracking leveraging Firebase Realtime Database for active GPS stream buffering.
- **Digital Material Passport (Phase 13):** Cryptographically robust tracking (simulated) of chain of custody (Source → Pickup → Processor → Receiver).
- **Environmental Impact Engine (Phase 14):** Transparent CO₂e and Virgin Material avoidance calculator grounded in verified EPA WARM factors, completely avoiding AI hallucinations.
- **Future Radar & Stagnation Intelligence (Phases 15-16):** 4-horizon time-series forecasting for surplus and demand. Dynamic alerts for unused exchanged materials (stagnation) with automated downstream pathway resolution (No Viable Pathway, Transformation Required, Immediate Match).
- **SYMBIO Analytics (Phase 17):** Dedicated dynamic dashboard aggregating live metrics across Company, Ecosystem, and Platform scopes with custom charts tracking Resource Flow, Exchange Volume, and Material Categories.

## Architecture
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic
- **Authentication:** Firebase Authentication, Firebase Admin SDK
- **Design:** Open-source UI assets (Lucide React)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Firebase Project (for Authentication)

### Authentication Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **Authentication** > **Sign-in method** and enable **Email/Password**.
4. Navigate to **Project settings** > **General** and add a web app to get your Firebase configuration keys.
5. Navigate to **Project settings** > **Service accounts** and generate a new private key. Save this file as `firebase-service-account.json` in the `backend` directory.

### Environment Variables

**Frontend (`frontend/.env`):**
Create a `.env` file in the `frontend` directory by copying `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend (`.env` in root or backend):**
Configure your MongoDB and Firebase Admin credentials as seen in `.env.example`.
For MongoDB Atlas, you must provide your cluster connection string in `MONGODB_URI`.
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=symbio_db
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
```

### Running Locally

**How to run Backend:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: Ensure `firebase-service-account.json` is present in the backend directory for token verification to work.*

**How to run Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker
To run using Docker Compose:
```bash
docker-compose up --build
```

