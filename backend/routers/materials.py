from fastapi import APIRouter, HTTPException
from typing import List
import repository
from schemas import MaterialCreate, Material

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.post("/", response_model=Material)
async def create_material_endpoint(material: MaterialCreate):
    return await repository.create_material(material)

@router.get("/", response_model=List[Material])
async def list_materials_endpoint():
    return await repository.list_materials()

@router.get("/{material_id}", response_model=Material)
async def get_material_endpoint(material_id: str):
    material = await repository.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material
