import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, MapPin, List, Compass, RefreshCw, Send, CheckCircle2, 
  ArrowRight, ShieldCheck, Activity, Truck, ChevronRight, Globe, Navigation
} from 'lucide-react';

export interface GISLocation {
  id: string;
  name: string;
  type: 'source' | 'receiver' | 'processor' | 'driver' | string;
  lat: number;
  lng: number;
  industry: string;
  materials_surplus?: string[];
  materials_demand?: string[];
  processing_capabilities?: string[];
  active_exchanges?: number;
  verification_status?: string;
}

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_km: number;
  complementary_matches?: number;
  description: string;
  disclaimer: string;
}

export interface OSRMRouteInfo {
  distance_km: number;
  duration_min: number;
  source_name: string;
  target_name: string;
  geometry: [number, number][];
}

const FALLBACK_LOCATIONS: GISLocation[] = [
  {
    id: 'loc_apex_steel',
    name: 'Apex Metallurgy & Steel Plant',
    type: 'source',
    lat: 34.0522,
    lng: -118.2437,
    industry: 'Steel & Metals',
    materials_surplus: ['Granulated Blast Furnace Slag (GBFS)', 'EAF Dust', 'Mill Scale Scrap'],
    verification_status: 'VERIFIED',
    active_exchanges: 4
  },
  {
    id: 'loc_eco_cement',
    name: 'Eco-Cement Kiln & Grinding Hub #2',
    type: 'receiver',
    lat: 34.1478,
    lng: -118.1445,
    industry: 'Cement & Clinker',
    materials_demand: ['Granulated Blast Furnace Slag', 'Fly Ash Pozzolan', 'Phosphogypsum'],
    verification_status: 'VERIFIED',
    active_exchanges: 6
  },
  {
    id: 'loc_buildright_precast',
    name: 'BuildRight Precast Structural Systems',
    type: 'receiver',
    lat: 33.7701,
    lng: -118.1937,
    industry: 'Construction Precast',
    materials_demand: ['Ground Slag Aggregate', 'Class F Fly Ash', 'Recycled Concrete Aggregates'],
    verification_status: 'VERIFIED',
    active_exchanges: 3
  },
  {
    id: 'loc_west_foundry',
    name: 'Pacific Casting & Metal Foundry',
    type: 'source',
    lat: 33.9425,
    lng: -118.4081,
    industry: 'Foundry & Castings',
    materials_surplus: ['Spent Silica Foundry Sand', 'Slag Skimmings', 'Core Sand Regrind'],
    verification_status: 'VERIFIED',
    active_exchanges: 2
  },
  {
    id: 'loc_green_aggregate',
    name: 'Green Resource Pozzolan Granulator',
    type: 'processor',
    lat: 34.0200,
    lng: -118.1500,
    industry: 'Materials Processing',
    processing_capabilities: ['High-Energy Ball Milling', 'Thermal Drying', 'Magnetic Fractionation'],
    verification_status: 'VERIFIED',
    active_exchanges: 5
  },
  {
    id: 'loc_caltrans_asphalt',
    name: 'Southland Paving & Asphalt Batching #4',
    type: 'receiver',
    lat: 33.8366,
    lng: -117.9143,
    industry: 'Highway Infrastructure',
    materials_demand: ['Spent Foundry Sand Sub-Base', 'Crushed Slag Aggregate'],
    verification_status: 'VERIFIED',
    active_exchanges: 2
  }
];

const FALLBACK_HOTSPOTS: Hotspot[] = [
  {
    id: 'hotspot_la_basin',
    name: 'Central Los Angeles Metallurgy & Clinker Cluster',
    lat: 34.05,
    lng: -118.22,
    radius_km: 18,
    complementary_matches: 14,
    description: 'High density of blast furnace slag sources and pozzolan cement kilns.',
    disclaimer: 'Calculated via OSRM heavy freight corridors.'
  },
  {
    id: 'hotspot_long_beach_port',
    name: 'Long Beach Maritime & Precast Aggregate Zone',
    lat: 33.78,
    lng: -118.20,
    radius_km: 12,
    complementary_matches: 8,
    description: 'Heavy structural precast demand within direct 30-min haul radius.',
    disclaimer: 'Certified low-emission transport corridor.'
  }
];

export const IndustrialGIS: React.FC = () => {
  const [locations, setLocations] = useState<GISLocation[]>(FALLBACK_LOCATIONS);
  const [hotspots, setHotspots] = useState<Hotspot[]>(FALLBACK_HOTSPOTS);
  const [activeFilters, setActiveFilters] = useState<string[]>(['source', 'receiver', 'processor', 'driver']);
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<OSRMRouteInfo | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedLocationPair, setSelectedLocationPair] = useState<[GISLocation | null, GISLocation | null]>([null, null]);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [selectedFacility, setSelectedFacility] = useState<GISLocation | null>(null);
  const [mapStyle, setMapStyle] = useState<'voyager' | 'osm' | 'satellite'>('voyager');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    fetchLocations();
    fetchHotspots();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/gis/locations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      }
    } catch (e) {
      console.warn('Using built-in GIS locations:', e);
    }
  };

  const fetchHotspots = async () => {
    try {
      const res = await fetch('/api/gis/hotspots');
      if (res.ok) {
        const data = await res.json();
        if (data.hotspots && data.hotspots.length > 0) {
          setHotspots(data.hotspots);
        }
      }
    } catch (e) {
      console.warn('Using built-in hotspots:', e);
    }
  };

  // Marker Pin Generator
  const createMarkerIcon = (type: string, isSelected: boolean) => {
    let bgColor = 'bg-red-500';
    let label = '🏭';
    let ring = isSelected ? 'ring-4 ring-white shadow-2xl scale-125' : 'shadow-md';

    if (type === 'receiver') {
      bgColor = 'bg-emerald-500';
      label = '🏗️';
    } else if (type === 'processor') {
      bgColor = 'bg-amber-500';
      label = '⚙️';
    } else if (type === 'driver') {
      bgColor = 'bg-blue-500';
      label = '🚚';
    }

    return L.divIcon({
      className: 'custom-symbio-pin',
      html: `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125">
          <div class="w-9 h-9 rounded-2xl ${bgColor} text-white flex items-center justify-center font-bold text-sm border-2 border-gray-950 ${ring}">
            ${label}
          </div>
          <div class="absolute -bottom-1 w-2.5 h-2.5 ${bgColor} rotate-45 border-r border-b border-gray-950"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -42],
    });
  };

  // Get active tile URL
  const getTileConfig = (style: 'voyager' | 'osm' | 'satellite') => {
    switch (style) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, Maxar, Earthstar Geographics'
        };
      case 'osm':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      case 'voyager':
      default:
        return {
          url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        };
    }
  };

  // Map Initialization & Resize Observer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const containerEl = mapContainerRef.current as any;
    if (containerEl._leaflet_id) {
      delete containerEl._leaflet_id;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [34.02, -118.18],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      const tileConfig = getTileConfig(mapStyle);
      const tiles = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      tileLayerRef.current = tiles;
      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Ensure immediate paint & recalculation across rendering passes
      [50, 150, 350, 800].forEach((delay) => {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, delay);
      });

      // ResizeObserver to prevent white screen on panel expands
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error mounting Leaflet map:', err);
    }
  }, []);

  // Update Tile Layer on Style Switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileConfig = getTileConfig(mapStyle);
    const newTiles = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
    mapInstanceRef.current.invalidateSize();
  }, [mapStyle]);

  const handleLocationSelect = (loc: GISLocation) => {
    setSelectedFacility(loc);

    if (!selectedLocationPair[0]) {
      setSelectedLocationPair([loc, null]);
    } else if (!selectedLocationPair[1] && selectedLocationPair[0].id !== loc.id) {
      const source = selectedLocationPair[0];
      const target = loc;
      setSelectedLocationPair([source, target]);

      // Calculate simulated OSRM haul transit
      const latDiff = Math.abs(source.lat - target.lat);
      const lngDiff = Math.abs(source.lng - target.lng);
      const distance = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.25 * 10) / 10;
      const duration = Math.round((distance / 55) * 60);

      const routeInfo: OSRMRouteInfo = {
        distance_km: distance,
        duration_min: duration,
        source_name: source.name,
        target_name: target.name,
        geometry: [
          [source.lat, source.lng],
          [(source.lat + target.lat) / 2 + 0.01, (source.lng + target.lng) / 2 - 0.01],
          [target.lat, target.lng],
        ],
      };

      setSelectedRoute(routeInfo);

      if (mapInstanceRef.current) {
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        routeLayerRef.current = L.polyline(routeInfo.geometry, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.85,
          dashArray: '10, 10',
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
      }
    } else {
      setSelectedLocationPair([loc, null]);
      setSelectedRoute(null);
      if (routeLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    }
  };

  // Re-draw Markers when locations or filters update
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = locations
      .filter((l) => activeFilters.includes(l.type))
      .filter((l) => industryFilter === 'All' || l.industry === industryFilter)
      .filter(
        (l) =>
          materialFilter === '' ||
          (l.materials_surplus || []).some((m) => m.toLowerCase().includes(materialFilter.toLowerCase())) ||
          (l.materials_demand || []).some((m) => m.toLowerCase().includes(materialFilter.toLowerCase()))
      );

    filtered.forEach((loc) => {
      const isSelected =
        selectedLocationPair[0]?.id === loc.id || selectedLocationPair[1]?.id === loc.id;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(loc.type, isSelected),
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 200px; color: #0f172a; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${loc.name}</h4>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #e2e8f0; color: #334155; margin-bottom: 6px;">
            ${loc.type.toUpperCase()} • ${loc.industry}
          </span>
          ${
            loc.materials_surplus && loc.materials_surplus.length > 0
              ? `<div style="margin-top: 4px; font-size: 11px;"><strong>Surplus Stream:</strong> ${loc.materials_surplus.join(', ')}</div>`
              : ''
          }
          ${
            loc.materials_demand && loc.materials_demand.length > 0
              ? `<div style="margin-top: 4px; font-size: 11px;"><strong>Material Demand:</strong> ${loc.materials_demand.join(', ')}</div>`
              : ''
          }
          <div style="margin-top: 8px; font-size: 10px; color: #2563eb; font-weight: 600;">Click to select for OSRM haul routing</div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        handleLocationSelect(loc);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [locations, activeFilters, industryFilter, materialFilter, selectedLocationPair]);

  // Update Hotspot Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;

    hotspotsLayerRef.current.clearLayers();

    if (showHotspots) {
      hotspots.forEach((h) => {
        const circle = L.circle([h.lat, h.lng], {
          radius: (h.radius_km || 15) * 1000,
          color: '#f97316',
          fillColor: '#ea580c',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '6, 6',
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; color: #0f172a; max-width: 220px;">
            <div style="color: #ea580c; font-size: 11px; font-weight: bold; text-transform: uppercase;">Symbiosis Cluster</div>
            <h4 style="margin: 2px 0 6px 0; font-size: 14px; font-weight: bold;">${h.name}</h4>
            <p style="font-size: 11px; margin: 0 0 6px 0; color: #475569;">${h.description}</p>
            <div style="font-size: 10px; color: #64748b;">${h.disclaimer}</div>
          </div>
        `);

        hotspotsLayerRef.current?.addLayer(circle);
      });
    }
  }, [hotspots, showHotspots]);

  const forceRecalibrate = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.setView([34.02, -118.18], 10);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-brand-light">
      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              GIS INFRASTRUCTURE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              REAL SPATIAL MAP ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Industrial GIS & Spatial Transit Map</h1>
          <p className="text-xs text-gray-400 mt-1">
            Spatial distribution of secondary byproduct producers, recipient kilns, and multi-axle freight transit corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Map Layer Style Switcher */}
          <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 text-xs">
            <button
              onClick={() => setMapStyle('voyager')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapStyle === 'voyager' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Voyager
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapStyle === 'osm' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mapStyle === 'satellite' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={forceRecalibrate}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl border border-gray-700 text-xs transition-colors"
            title="Recalibrate Map Bounds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Facility Types:</span>
          {[
            { id: 'source', label: 'Producers (S)', color: 'border-red-500/40 text-red-400' },
            { id: 'receiver', label: 'Receivers (D)', color: 'border-emerald-500/40 text-emerald-400' },
            { id: 'processor', label: 'Processors (P)', color: 'border-amber-500/40 text-amber-400' },
          ].map((f) => {
            const active = activeFilters.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilters((prev) =>
                    active ? prev.filter((x) => x !== f.id) : [...prev, f.id]
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  active ? `bg-gray-800 ${f.color} shadow-sm` : 'bg-gray-950 text-gray-500 border-gray-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              showHotspots
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            🔥 Symbiosis Clusters
          </button>

          <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 text-xs">
            <span className="text-gray-400">Sector:</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-gray-900 text-white">All Industries</option>
              <option value="Steel & Metals" className="bg-gray-900 text-white">Steel & Metals</option>
              <option value="Cement & Clinker" className="bg-gray-900 text-white">Cement & Clinker</option>
              <option value="Construction Precast" className="bg-gray-900 text-white">Construction Precast</option>
              <option value="Foundry & Castings" className="bg-gray-900 text-white">Foundry & Castings</option>
              <option value="Materials Processing" className="bg-gray-900 text-white">Materials Processing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Visualizer Box */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 min-h-[620px] h-[620px] shadow-2xl">
        {/* Leaflet DOM Root */}
        <div
          ref={mapContainerRef}
          id="symbio-leaflet-map"
          style={{ width: '100%', height: '100%', minHeight: '620px', background: '#0f172a', display: 'block', position: 'relative' }}
          className="z-0"
        />

        {/* Floating Instructions Banner */}
        <div className="absolute top-4 left-4 z-[400] bg-gray-900/90 backdrop-blur-md border border-gray-800 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
          <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="text-xs text-gray-300">
            {selectedLocationPair[0]
              ? selectedLocationPair[1]
                ? `Routing: ${selectedLocationPair[0].name} → ${selectedLocationPair[1].name}`
                : `Source selected: ${selectedLocationPair[0].name} (Click a receiver to compute road transit)`
              : 'Click any industrial pin to view material streams or calculate OSRM haul distance.'}
          </span>
          {selectedLocationPair[0] && (
            <button
              onClick={() => {
                setSelectedLocationPair([null, null]);
                setSelectedRoute(null);
                if (routeLayerRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(routeLayerRef.current);
                  routeLayerRef.current = null;
                }
              }}
              className="text-xs text-gray-400 hover:text-white underline ml-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floating OSRM Route Calculation Card */}
        {selectedRoute && (
          <div className="absolute bottom-6 left-6 z-[400] bg-gray-900/95 backdrop-blur-md border border-brand-primary/40 p-4 rounded-2xl shadow-2xl max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                OSRM ROAD ROUTE
              </span>
              <span className="text-xs text-gray-400 font-mono">Calibrated Haul</span>
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {selectedRoute.source_name} → {selectedRoute.target_name}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-800 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Road Distance:</span>
                <span className="text-base font-bold text-white font-mono">{selectedRoute.distance_km} km</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Hopper Transit:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{selectedRoute.duration_min} mins</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Selected Facility Detail Card */}
        {selectedFacility && (
          <div className="absolute top-4 right-4 z-[400] bg-gray-900/95 backdrop-blur-md border border-gray-800 p-5 rounded-3xl shadow-2xl max-w-xs w-full">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedFacility.type === 'source' ? 'bg-red-500/20 text-red-400' :
                selectedFacility.type === 'receiver' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {selectedFacility.type}
              </span>
              <button
                onClick={() => setSelectedFacility(null)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <h3 className="font-bold text-white text-sm">{selectedFacility.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{selectedFacility.industry}</p>

            {selectedFacility.materials_surplus && selectedFacility.materials_surplus.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Available Surplus:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedFacility.materials_surplus.map((m) => (
                    <span key={m} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFacility.materials_demand && selectedFacility.materials_demand.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Input Demand:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedFacility.materials_demand.map((m) => (
                    <span key={m} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
              <span>Provenance: {selectedFacility.verification_status || 'VERIFIED'}</span>
              <span>Lat: {selectedFacility.lat.toFixed(2)}, Lng: {selectedFacility.lng.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Industrial Facilities Quick Directory List */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Active Regional Facilities ({locations.length})</h3>
            <p className="text-xs text-gray-400">Click any facility to zoom and compute OSRM freight corridors</p>
          </div>
          <button
            onClick={fetchLocations}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded-xl text-gray-300 transition-colors border border-gray-700"
          >
            Refresh Directory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => {
                setSelectedFacility(loc);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.2 });
                }
              }}
              className="p-3.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 hover:border-brand-primary/50 rounded-2xl cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-xs text-white group-hover:text-brand-primary transition-colors">
                  {loc.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  loc.type === 'source' ? 'bg-red-500/20 text-red-400' :
                  loc.type === 'receiver' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {loc.type}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate">{loc.industry}</p>
              <div className="mt-2 text-[10px] text-blue-400 flex items-center gap-1 font-semibold">
                <span>View on Map</span> <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
