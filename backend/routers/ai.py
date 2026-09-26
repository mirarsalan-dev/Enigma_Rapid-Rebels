from fastapi import APIRouter, Depends, HTTPException
from schemas import MaterialAnalysisRequest, MaterialDNAResponse, MaterialDNA
from services.ai_provider import get_ai_provider, AIProvider
from database import db

router = APIRouter(tags=["AI Material Analysis"])

@router.post("/materials/analyze", response_model=MaterialDNAResponse)
async def analyze_material(
    request: MaterialAnalysisRequest,
    ai_provider: AIProvider = Depends(get_ai_provider)
):
    try:
        dna_data = await ai_provider.extract_material_dna(request.description)
        
        # Enforce validation
        dna = MaterialDNA(**dna_data)
        
        # Store the resulting Material DNA in MongoDB
        if db is not None:
            await db.material_dna.insert_one(dna.model_dump())
            
        return MaterialDNAResponse(dna=dna)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
