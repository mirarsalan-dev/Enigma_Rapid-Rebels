# Enigma_Symbio

**SYMBIO — AI Industrial Resource Intelligence Network**

## Problem Statement
Discovering Hidden Industrial Symbiosis.

## Hackathon Constraints Adherence
- **AI Acknowledgment:** This project utilizes AI-generated code (acknowledged as per hackathon rules) for foundational setup and development acceleration.
- **Open-source:** All libraries and frameworks used are open-source.
- **Fresh Development:** All code was developed during the hackathon period.

## Architecture
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic
- **Database:** MongoDB Atlas
- **Authentication:** Firebase Authentication, Firebase Admin SDK
- **AI:** Open-source AI model integration
- **GIS:** Leaflet, OpenStreetMap, OSRM
- **Knowledge Graph:** W2RKG, NetworkX (extensible to Neo4j)

## Project Structure
- `/frontend`: React + Vite frontend application
- `/backend`: FastAPI Python backend application

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker & Docker Compose (optional for local deployment)

### Environment Variables
Copy `.env.example` to `.env` and fill in the necessary configuration details. Do not use production credentials.
```bash
cp .env.example .env
```

### Running Locally (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running with Docker
```bash
docker-compose up --build
```
