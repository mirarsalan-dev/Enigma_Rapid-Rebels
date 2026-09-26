from fastapi import APIRouter
from schemas import AnalyticsResponse, AnalyticsMetrics, AnalyticsChartData
from database import waste_listings_collection, exchanges_collection, opportunities_collection, companies_collection
import asyncio

router = APIRouter(tags=["Analytics"])

@router.get("/analytics/{scope}", response_model=AnalyticsResponse)
async def get_analytics(scope: str, company_id: str = None):
    # scope: 'company', 'ecosystem', 'platform'
    
    # 1. Base Match Queries
    listing_match = {}
    exchange_match = {}
    opp_match = {}
    
    if scope == "company" and company_id:
        listing_match = {"company_id": company_id}
        exchange_match = {"$or": [{"provider_id": company_id}, {"receiver_id": company_id}]}
        opp_match = {"$or": [{"source_company_id": company_id}, {"receiving_company_id": company_id}]}
    elif scope == "ecosystem":
        # Example logic: ecosystem could filter by a specific region if provided
        pass
        
    # 2. Fetch Aggregations
    # Listings
    listings_count = await waste_listings_collection.count_documents(listing_match)
    
    # Exchanges
    exchanges_count = await exchanges_collection.count_documents(exchange_match)
    successful_exchanges = await exchanges_collection.count_documents({**exchange_match, "status": {"$in": ["COMPLETED", "SYNCED"]}})
    active_exchanges = await exchanges_collection.count_documents({**exchange_match, "status": {"$in": ["PENDING", "IN_TRANSIT", "SYNCING"]}})
    failed_exchanges = await exchanges_collection.count_documents({**exchange_match, "status": {"$in": ["FAILED", "CANCELLED"]}})
    
    # Opportunities
    opps_count = await opportunities_collection.count_documents(opp_match)
    
    # Total volume logic (aggregate quantity_available from listings)
    pipeline = [{"$match": listing_match}, {"$group": {"_id": None, "total_qty": {"$sum": "$quantity_available"}}}]
    vol_result = await waste_listings_collection.aggregate(pipeline).to_list(length=1)
    resource_generated = vol_result[0]["total_qty"] if vol_result else 0.0
    
    # Diverted (aggregate from successful exchanges)
    # Assuming exchanges have a "quantity" field
    ex_pipeline = [{"$match": {**exchange_match, "status": {"$in": ["COMPLETED", "SYNCED"]}}}, {"$group": {"_id": None, "total_qty": {"$sum": "$quantity"}}}]
    ex_result = await exchanges_collection.aggregate(ex_pipeline).to_list(length=1)
    resource_diverted = ex_result[0]["total_qty"] if ex_result else 0.0
    resource_exchanged = resource_diverted # Simplifying for this implementation

    # Calculate average opportunity score
    score_pipeline = [{"$match": opp_match}, {"$group": {"_id": None, "avg_score": {"$avg": "$opportunity_score"}}}]
    score_result = await opportunities_collection.aggregate(score_pipeline).to_list(length=1)
    avg_opp_score = score_result[0]["avg_score"] if score_result and score_result[0]["avg_score"] is not None else 0.0

    # Determine if insufficient data
    has_data = (listings_count > 0) or (exchanges_count > 0) or (opps_count > 0)
    
    metrics = AnalyticsMetrics(
        resource_generated=resource_generated,
        resource_exchanged=resource_exchanged,
        resource_diverted=resource_diverted,
        active_exchanges=active_exchanges,
        successful_exchanges=successful_exchanges,
        failed_exchanges=failed_exchanges,
        average_opportunity_score=avg_opp_score,
        potential_environmental_benefit=0.0, # Placeholder if no specific field is found
        avg_transport_distance=0.0,
        material_stagnation_volume=0.0
    )
    
    charts = AnalyticsChartData(
        resource_flow=[],
        industry_participation=[],
        exchange_volume=[],
        material_categories=[],
        monthly_trends=[],
        opportunity_pipeline=[]
    )
    
    if has_data:
        # Populate charts based on aggregations (Simplified for demonstration)
        # In a full implementation, these would be complex aggregation pipelines grouping by date, category, etc.
        
        # Example for material_categories
        cat_pipeline = [{"$match": listing_match}, {"$group": {"_id": "$material.category", "count": {"$sum": 1}}}]
        cats = await waste_listings_collection.aggregate(cat_pipeline).to_list(length=10)
        charts.material_categories = [{"label": c["_id"] or "Unknown", "value": c["count"]} for c in cats]
        
    return AnalyticsResponse(
        scope=scope,
        has_data=has_data,
        metrics=metrics,
        charts=charts
    )
