import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Filter, Truck, Factory, Zap, Info, Clock, AlertTriangle } from 'lucide-react';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const receiverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const processorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GISLocation {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  industry: string;
  materials_surplus: string[];
  materials_demand: string[];
  processing_capabilities: string[];
  active_exchanges: number;
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_km: number;
  description: string;
  disclaimer: string;
}

interface OSRMRouteInfo {
  distance_km: number;
  duration_min: number;
  geometry: [number, number][]; // lat, lng
}

export const IndustrialGIS: React.FC = () => {
  const [locations, setLocations] = useState<GISLocation[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['source', 'receiver', 'processor', 'driver']);
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<OSRMRouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedLocationPair, setSelectedLocationPair] = useState<[GISLocation | null, GISLocation | null]>([null, null]);

  useEffect(() => {
    fetchLocations();
    fetchHotspots();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/gis/locations');
      if (res.ok) {
        setLocations(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHotspots = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/gis/hotspots');
      if (res.ok) {
        const data = await res.json();
        setHotspots(data.hotspots);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateRoute = async (source: GISLocation, target: GISLocation) => {
    setRouteLoading(true);
    setSelectedRoute(null);
    try {
      // Use OSRM public API for actual road distance and ETA
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns coordinates as [lng, lat]
          const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          
          setSelectedRoute({
            distance_km: parseFloat((route.distance / 1000).toFixed(1)),
            duration_min: Math.round(route.duration / 60),
            geometry: coords
          });
        }
      }
    } catch (e) {
      console.error("OSRM Route Error", e);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleLocationClick = (loc: GISLocation) => {
    if (selectedLocationPair[0] === null) {
      setSelectedLocationPair([loc, null]);
      setSelectedRoute(null);
    } else if (selectedLocationPair[0].id === loc.id) {
      setSelectedLocationPair([null, null]);
      setSelectedRoute(null);
    } else {
      setSelectedLocationPair([selectedLocationPair[0], loc]);
      calculateRoute(selectedLocationPair[0], loc);
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'source': return sourceIcon;
      case 'receiver': return receiverIcon;
      case 'processor': return processorIcon;
      case 'driver': return driverIcon;
      default: return sourceIcon;
    }
  };

  return (
    <div className="h-full flex flex-col relative text-brand-light">
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            SYMBIO Industrial GIS
          </h1>
          <p className="text-sm text-gray-400">Interactive geographic intelligence for industrial symbiosis</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={industryFilter} 
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-gray-800 text-sm text-white px-3 py-1.5 rounded-lg border border-gray-700"
          >
            <option value="All">All Industries</option>
            <option value="Steel Industry">Steel</option>
            <option value="Construction Industry">Construction</option>
            <option value="Cement Industry">Cement</option>
            <option value="Recycling">Recycling</option>
          </select>
          <input 
            type="text" 
            placeholder="Filter Material..."
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="bg-gray-800 text-sm text-white px-3 py-1.5 rounded-lg border border-gray-700 w-32"
          />
          {['source', 'receiver', 'processor'].map(type => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeFilters.includes(type) ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type === 'source' ? 'Surplus' : type === 'receiver' ? 'Demand' : 'Processing'}
            </button>
          ))}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showHotspots ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Hotspots
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-800 relative z-0">
        <MapContainer center={[34.10, -118.20]} zoom={10} style={{ height: '100%', width: '100%', background: '#111' }}>
          <style>
            {`
              .dark-tiles .leaflet-layer {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
            `}
          </style>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className="dark-tiles"
          />

          {showHotspots && hotspots.map(h => (
            <Circle
              key={h.id}
              center={[h.lat, h.lng]}
              radius={h.radius_km * 1000}
              pathOptions={{ fillColor: 'orange', color: 'orange', fillOpacity: 0.2, weight: 1 }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-orange-500 mb-1">INDUSTRIAL SYMBIOSIS HOTSPOT</h3>
                  <p className="font-medium text-gray-800 text-sm">{h.name}</p>
                  <p className="text-xs text-gray-600 mt-2">{h.description}</p>
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-orange-800 italic leading-tight">
                      {h.disclaimer}
                    </p>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {locations
            .filter(l => activeFilters.includes(l.type))
            .filter(l => industryFilter === 'All' || l.industry === industryFilter)
            .filter(l => materialFilter === '' || 
                         l.materials_surplus.some(m => m.toLowerCase().includes(materialFilter.toLowerCase())) ||
                         l.materials_demand.some(m => m.toLowerCase().includes(materialFilter.toLowerCase()))
            )
            .map(loc => (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]} 
              icon={getIcon(loc.type)}
              eventHandlers={{
                click: () => handleLocationClick(loc)
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{loc.name}</h3>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">{loc.industry} • {loc.type}</p>
                  
                  {loc.materials_surplus.length > 0 && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-gray-700">Surplus:</span>
                      <span className="text-xs text-gray-600 ml-1">{loc.materials_surplus.join(', ')}</span>
                    </div>
                  )}
                  {loc.materials_demand.length > 0 && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-gray-700">Demand:</span>
                      <span className="text-xs text-gray-600 ml-1">{loc.materials_demand.join(', ')}</span>
                    </div>
                  )}
                  {loc.processing_capabilities.length > 0 && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-gray-700">Processor:</span>
                      <span className="text-xs text-gray-600 ml-1">{loc.processing_capabilities.join(', ')}</span>
                    </div>
                  )}
                  <p className="text-xs text-blue-600 mt-2 font-medium cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLocationClick(loc); }}>
                    {selectedLocationPair[0]?.id === loc.id ? 'Selected as Source (Click another to route)' : 'Select for Routing'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedRoute && (
            <Polyline 
              positions={selectedRoute.geometry} 
              pathOptions={{ color: '#8b5cf6', weight: 4, opacity: 0.8, dashArray: '10, 10' }} 
            />
          )}
        </MapContainer>
      </div>

      {/* Floating Route Info Panel */}
      {selectedLocationPair[0] && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl p-4 w-[400px] z-[1000] flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">Logistics Feasibility</h3>
            <button onClick={() => {setSelectedLocationPair([null, null]); setSelectedRoute(null);}} className="text-xs text-gray-400 hover:text-white">Clear</button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm mb-3">
            <div className="truncate flex-1 text-red-400 font-medium">{selectedLocationPair[0].name}</div>
            <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
            <div className="truncate flex-1 text-green-400 font-medium text-right">
              {selectedLocationPair[1] ? selectedLocationPair[1].name : 'Select Destination...'}
            </div>
          </div>

          {routeLoading ? (
            <div className="flex items-center justify-center py-2 text-gray-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Calculating OSRM Road Distance...
            </div>
          ) : selectedRoute ? (
            <div className="bg-gray-800 rounded-lg p-3 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-400 mb-1 flex items-center"><Truck className="w-3 h-3 mr-1" /> Road Distance</span>
                <span className="text-lg font-bold text-white">{selectedRoute.distance_km} km</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> ETA</span>
                <span className="text-lg font-bold text-white">{selectedRoute.duration_min} min</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">
              Select a second facility on the map to calculate road logistics via OSRM.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
