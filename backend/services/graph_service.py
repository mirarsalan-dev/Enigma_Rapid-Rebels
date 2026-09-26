import networkx as nx
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod

class GraphProvider(ABC):
    @abstractmethod
    def add_node(self, node_id: str, node_type: str, properties: Dict[str, Any]):
        pass

    @abstractmethod
    def add_edge(self, source_id: str, target_id: str, relationship: str, source_type: str = "known"):
        pass

    @abstractmethod
    def find_paths(self, source_id: str, target_id: str, max_hops: int) -> List[List[Dict[str, Any]]]:
        pass

    @abstractmethod
    def find_closed_loops(self, max_length: int) -> List[List[Dict[str, Any]]]:
        pass

    @abstractmethod
    def get_all_nodes(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def get_all_edges(self) -> List[Dict[str, Any]]:
        pass

class NetworkXProvider(GraphProvider):
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, node_type: str, properties: Dict[str, Any]):
        self.graph.add_node(node_id, type=node_type, **properties)

    def add_edge(self, source_id: str, target_id: str, relationship: str, source_type: str = "known"):
        # source_type can be "known", "ai_suggested", "externally_discovered"
        self.graph.add_edge(source_id, target_id, relationship=relationship, source_type=source_type)

    def _format_path(self, path: List[str]) -> List[Dict[str, Any]]:
        formatted = []
        for i in range(len(path)):
            node = path[i]
            node_data = self.graph.nodes[node]
            step = {"id": node, "type": node_data.get("type"), "properties": {k: v for k, v in node_data.items() if k != "type"}}
            if i < len(path) - 1:
                edge_data = self.graph.get_edge_data(node, path[i+1])
                step["edge_to_next"] = edge_data
            formatted.append(step)
        return formatted

    def find_paths(self, source_id: str, target_id: str, max_hops: int) -> List[List[Dict[str, Any]]]:
        if source_id not in self.graph or target_id not in self.graph:
            return []
            
        try:
            paths = list(nx.all_simple_paths(self.graph, source=source_id, target=target_id, cutoff=max_hops))
            return [self._format_path(p) for p in paths]
        except nx.NetworkXNoPath:
            return []

    def find_closed_loops(self, max_length: int) -> List[List[Dict[str, Any]]]:
        try:
            cycles = list(nx.simple_cycles(self.graph, length_bound=max_length))
            formatted_cycles = []
            for cycle in cycles:
                # To represent a closed loop, append the first node at the end
                cycle_path = cycle + [cycle[0]]
                formatted_cycles.append(self._format_path(cycle_path))
            return formatted_cycles
        except Exception:
            return []
            
    def get_all_nodes(self) -> List[Dict[str, Any]]:
        return [{"id": n, **d} for n, d in self.graph.nodes(data=True)]
        
    def get_all_edges(self) -> List[Dict[str, Any]]:
        return [{"source": u, "target": v, **d} for u, v, d in self.graph.edges(data=True)]

# Singleton instance
_graph_provider = NetworkXProvider()

def get_graph_provider() -> GraphProvider:
    return _graph_provider

def seed_initial_graph(provider: GraphProvider):
    # Seed data to demonstrate relationships that a normal waste marketplace would not find
    
    # Industry -> Material
    provider.add_node("Steel Industry", "Industry", {"name": "Steel Industry"})
    provider.add_node("Construction Industry", "Industry", {"name": "Construction Industry"})
    
    # Materials
    provider.add_node("Slag", "Material", {"name": "Slag"})
    provider.add_node("GBFS", "Material", {"name": "GBFS"})
    provider.add_node("Eco-Cement", "Material", {"name": "Eco-Cement"})
    
    # Processes
    provider.add_node("Granulation", "Process", {"name": "Granulation"})
    provider.add_node("Grinding", "Process", {"name": "Grinding"})
    
    # Applications
    provider.add_node("Construction Material", "Application", {"name": "Construction Material"})
    
    # Companies
    provider.add_node("Apex Steel Plant", "Company", {"name": "Apex Steel Plant"})
    provider.add_node("BuildRight Construction", "Company", {"name": "BuildRight Construction"})
    provider.add_node("Green Aggregate Processors", "Company", {"name": "Green Aggregate Processors"})
    
    # Relationships
    provider.add_edge("Steel Industry", "Slag", "generates", "known")
    provider.add_edge("Slag", "Granulation", "can_be_processed_by", "ai_suggested")
    provider.add_edge("Granulation", "GBFS", "produces", "known")
    provider.add_edge("GBFS", "Construction Material", "can_be_used_in", "ai_suggested")
    
    provider.add_edge("Apex Steel Plant", "Slag", "generates", "known")
    provider.add_edge("Green Aggregate Processors", "Granulation", "has_capability", "known")
    provider.add_edge("Green Aggregate Processors", "Slag", "consumes", "known")
    provider.add_edge("Green Aggregate Processors", "GBFS", "generates", "known")
    
    provider.add_edge("BuildRight Construction", "Construction Material", "demands", "known")
    provider.add_edge("GBFS", "BuildRight Construction", "can_supply", "ai_suggested")

    # Add closed loop example (circular economy)
    provider.add_node("Steel Scrap", "Material", {"name": "Steel Scrap"})
    provider.add_edge("BuildRight Construction", "Steel Scrap", "generates", "known")
    provider.add_edge("Steel Scrap", "Apex Steel Plant", "consumes", "known")

seed_initial_graph(_graph_provider)
