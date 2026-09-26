from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from services.graph_service import get_graph_provider

router = APIRouter(tags=["Graph Discovery"])

@router.get("/graph/nodes", response_model=List[Dict[str, Any]])
async def get_all_nodes():
    provider = get_graph_provider()
    return provider.get_all_nodes()

@router.get("/graph/edges", response_model=List[Dict[str, Any]])
async def get_all_edges():
    provider = get_graph_provider()
    return provider.get_all_edges()

@router.get("/graph/data", response_model=Dict[str, Any])
async def get_graph_data():
    provider = get_graph_provider()
    nodes = provider.get_all_nodes()
    edges = provider.get_all_edges()
    return {"nodes": nodes, "links": edges}

@router.get("/graph/discover/hop", response_model=List[List[Dict[str, Any]]])
async def discover_hops(
    source_id: str, 
    target_id: str, 
    hops: int = Query(1, ge=1, le=5)
):
    """
    Discover paths of exactly n hops between source and target.
    hops=1 means A -> B (1 edge)
    hops=2 means A -> X -> B (2 edges)
    """
    provider = get_graph_provider()
    # find_paths uses max_hops. networkx cutoff is the depth.
    # depth = hops
    all_paths = provider.find_paths(source_id, target_id, hops)
    
    # Filter for exact number of edges (hops)
    # A path with N edges has N+1 nodes.
    # The formatted path is a list of N+1 dicts.
    # Actually wait, `find_paths` returns a list of dictionaries per node in the path.
    # So if there are N hops, there are N+1 nodes in the path list.
    exact_hop_paths = [p for p in all_paths if len(p) == hops + 1]
    
    return exact_hop_paths

@router.get("/graph/discover/closed-loops", response_model=List[List[Dict[str, Any]]])
async def discover_closed_loops(max_length: int = Query(5, ge=2, le=10)):
    provider = get_graph_provider()
    return provider.find_closed_loops(max_length)
