from schemas import EnvironmentalImpact, ImpactFactor
from typing import Dict

# ---------------------------------------------------------
# SYMBIO ENVIRONMENTAL CALCULATION ENGINE
# ---------------------------------------------------------
# Rules: 
# 1. Never invent CO2 values dynamically with AI.
# 2. Use established factors and methodologies.
# 3. Transparently document sources, units, and assumptions.
# ---------------------------------------------------------

# Hardcoded Emission Factors (kg CO2e per kg of material)
# Note: Negative values mean "emissions avoided" (a benefit)
EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
    "Plastic": {
        "virgin_production": 1.7, # EPA WARM model: kg CO2e per kg virgin plastic
        "disposal_landfill": 0.04 # EPA WARM model: kg CO2e per kg landfilled
    },
    "Metal": {
        "virgin_production": 4.5, 
        "disposal_landfill": 0.02
    },
    "Organic": {
        "virgin_production": 0.5,
        "disposal_landfill": 1.1 # High methane potential in landfill
    },
    "Glass": {
        "virgin_production": 0.8,
        "disposal_landfill": 0.01
    },
    "Default": {
        "virgin_production": 1.0,
        "disposal_landfill": 0.05
    }
}

# Transport Emission Factor
# Average Heavy Duty Truck: 0.12 kg CO2e per ton-km
TRANSPORT_EMISSION_FACTOR_PER_TON_KM = 0.12 

def calculate_environmental_impact(material_category: str, quantity_kg: float, distance_km: float) -> EnvironmentalImpact:
    # 1. Identify Factors
    factors = EMISSION_FACTORS.get(material_category, EMISSION_FACTORS["Default"])
    
    # 2. Waste Diverted (Quantity)
    waste_diverted = quantity_kg
    
    # 3. Potential Virgin Material Avoided
    virgin_avoided_value = quantity_kg * factors["virgin_production"]
    virgin_factor = ImpactFactor(
        name="Virgin Material Avoided",
        value=virgin_avoided_value,
        unit="kg CO2e",
        source="EPA WARM Model v15",
        assumption=f"Assumes 1:1 replacement of virgin {material_category} production.",
        calculation_method=f"{quantity_kg} kg * {factors['virgin_production']} kg CO2e/kg"
    )
    
    # 4. Avoided Disposal Impact
    disposal_avoided_value = quantity_kg * factors["disposal_landfill"]
    disposal_factor = ImpactFactor(
        name="Avoided Disposal (Landfill)",
        value=disposal_avoided_value,
        unit="kg CO2e",
        source="EPA WARM Model v15",
        assumption=f"Assumes alternative was 100% landfill for {material_category}.",
        calculation_method=f"{quantity_kg} kg * {factors['disposal_landfill']} kg CO2e/kg"
    )
    
    # 5. Transport Emissions (Negative impact on benefit)
    quantity_tons = quantity_kg / 1000.0
    transport_value = quantity_tons * distance_km * TRANSPORT_EMISSION_FACTOR_PER_TON_KM
    transport_factor = ImpactFactor(
        name="Transport Emissions",
        value=transport_value, # This is an emission (cost)
        unit="kg CO2e",
        source="GHG Protocol Transport Tool",
        assumption="Heavy Duty Truck average emission factor.",
        calculation_method=f"{quantity_tons:.2f} tons * {distance_km} km * {TRANSPORT_EMISSION_FACTOR_PER_TON_KM} kg CO2e/ton-km"
    )
    
    # 6. Net Benefit
    # Benefit = Avoided Virgin + Avoided Disposal - Transport Cost
    net_benefit = virgin_avoided_value + disposal_avoided_value - transport_value
    
    return EnvironmentalImpact(
        waste_diverted_kg=waste_diverted,
        virgin_material_avoided_kg_co2e=virgin_factor,
        avoided_disposal_kg_co2e=disposal_factor,
        transport_emissions_kg_co2e=transport_factor,
        net_benefit_kg_co2e=net_benefit
    )
