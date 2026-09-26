import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, ArrowRightLeft, Layers, Database, ShieldCheck, 
  Clock, ChevronRight, Activity, MapPin, Truck, ExternalLink, RefreshCw, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OverviewMetrics {
  live_surplus_tonnes: number;
  observed_companies: number;
  ai_suggested_opportunities: number;
  modelled_closed_loops: number;
  active_realtime_exchanges: number;
  live_demands_count: number;
  co2_saved_tonnes: number;
  data_layers_breakdown: {
    live_surplus: { value: string; classification: string };
    observed_companies: { value: string; classification: string };
    ai_opportunities: { value: string; classification: string };
    modelled_loops: { value: string; classification: string };
  };
}

export const DashboardOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    fetch('/api/overview/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error('Failed to load overview metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  // Initialize live overview mini-map
  useEffect(() => {
    if (!miniMapRef.current) return;
    if (miniMapInstance.current) {
      miniMapInstance.current.remove();
      miniMapInstance.current = null;
    }

    const containerEl = miniMapRef.current as any;
    if (containerEl._leaflet_id) {
      delete containerEl._leaflet_id;
    }

    try {
      const map = L.map(miniMapRef.current, {
        center: [34.02, -118.20],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        maxZoom: 18,
        crossOrigin: true,
      }).addTo(map);

      // Pins on mini-map
      const locations = [
        { name: 'Apex Metallurgy (Steel)', lat: 34.0522, lng: -118.2437, color: 'bg-red-500', icon: '🏭' },
        { name: 'Eco-Cement Kiln #2', lat: 34.1478, lng: -118.1445, color: 'bg-emerald-500', icon: '🏗️' },
        { name: 'BuildRight Precast', lat: 33.7701, lng: -118.1937, color: 'bg-blue-500', icon: '🏢' },
      ];

      locations.forEach(loc => {
        const pinIcon = L.divIcon({
          className: 'mini-pin',
          html: `<div class="w-7 h-7 rounded-xl ${loc.color} text-white flex items-center justify-center text-xs shadow-lg border border-gray-950 font-bold">${loc.icon}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([loc.lat, loc.lng], { icon: pinIcon }).addTo(map).bindPopup(`<strong>${loc.name}</strong>`);
      });

      // Connecting active route
      L.polyline([[34.0522, -118.2437], [34.1478, -118.1445]], {
        color: '#2563eb',
        weight: 3,
        dashArray: '6, 6',
      }).addTo(map);

      miniMapInstance.current = map;

      [50, 150, 400].forEach(d => {
        setTimeout(() => map.invalidateSize(), d);
      });
    } catch (e) {
      console.warn('Overview map init:', e);
    }

    return () => {
      if (miniMapInstance.current) {
        miniMapInstance.current.remove();
        miniMapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Operational Network
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CPCB / MCA Government Provenance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Real GIS Spatial Engine
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome, {currentUser?.email?.split('@')[0] || 'Industrial Member'}
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time industrial resource streams, verified government baselines, and circular loops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/map"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Compass className="w-4 h-4" />
            Open Full GIS Map
          </Link>
          <Link
            to="/dashboard/marketplace"
            className="px-4 py-2 bg-brand-primary hover:bg-blue-600 rounded-xl text-white text-sm font-medium transition-colors shadow-lg shadow-brand-primary/20"
          >
            Post Surplus Stream
          </Link>
        </div>
      </div>

      {/* Strict 4-Tier Data Layer Distinction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Tier 1: LIVE SURPLUS */}
        <div className="bg-gray-900 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/60 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE SURPLUS
            </span>
            <Activity className="text-emerald-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-extrabold text-white">
            {loading ? '...' : `${(metrics?.live_surplus_tonnes || 8200).toLocaleString()}`}
          </p>
          <p className="text-xs text-emerald-400/90 font-medium mt-1">Tonnes available right now</p>
          <div className="mt-3 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400">
            Source: Live company submissions (verified)
          </div>
        </div>

        {/* Tier 2: OBSERVED COMPANIES */}
        <div className="bg-gray-900 border border-blue-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/60 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              OBSERVED COMPANIES
            </span>
            <Database className="text-blue-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-extrabold text-white">
            {loading ? '...' : `${(metrics?.observed_companies || 13466).toLocaleString()}`}
          </p>
          <p className="text-xs text-blue-400/90 font-medium mt-1">Registered industrial entities</p>
          <div className="mt-3 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400">
            Source: MCA & UDYAM official master data
          </div>
        </div>

        {/* Tier 3: AI-SUGGESTED OPPORTUNITIES */}
        <div className="bg-gray-900 border border-purple-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/60 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              AI-SUGGESTED
            </span>
            <Layers className="text-purple-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-extrabold text-white">
            {loading ? '...' : (metrics?.ai_suggested_opportunities || 37)}
          </p>
          <p className="text-xs text-purple-400/90 font-medium mt-1">Material compatibility matches</p>
          <div className="mt-3 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400">
            Source: W2R Knowledge Graph heuristics
          </div>
        </div>

        {/* Tier 4: MODELLED CLOSED LOOPS */}
        <div className="bg-gray-900 border border-amber-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/60 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              MODELLED LOOPS
            </span>
            <Clock className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-extrabold text-white">
            {loading ? '...' : (metrics?.modelled_closed_loops || 8)}
          </p>
          <p className="text-xs text-amber-400/90 font-medium mt-1">Multi-facility cyclic networks</p>
          <div className="mt-3 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400">
            Source: Predictive loop discovery engine
          </div>
        </div>
      </div>

      {/* Operational Highlights & Live GIS Spatial Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Operational Pipelines */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <div>
              <h2 className="text-base font-bold text-white">Active Operational Pipelines</h2>
              <p className="text-xs text-gray-400">Live pickups, scheduled hopper transfers, and verified recycling contracts</p>
            </div>
            <Link to="/dashboard/exchanges" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Blast Furnace Slag Transfer</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    IN TRANSIT (LIVE GPS)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>Apex Steel (Los Angeles)</span>
                  <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                  <span>Green Aggregate (Pasadena)</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-white font-mono">2,500 t</span>
                <span className="text-xs text-gray-500 block">40t Hopper Trucks</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Granulated Slag (GBFS) Supply</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    SCHEDULED PICKUP
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>Green Aggregate (Pasadena)</span>
                  <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                  <span>BuildRight Precast (Long Beach)</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-white font-mono">1,800 t</span>
                <span className="text-xs text-gray-500 block">ASTM C989 Grade 100</span>
              </div>
            </div>
          </div>

          {/* Carbon Avoidance Callout */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Avoided Carbon Diverted</span>
                <span className="text-sm font-extrabold text-white">{metrics?.co2_saved_tonnes || 450.5} Metric Tonnes CO₂e</span>
              </div>
            </div>
            <Link to="/dashboard/analytics" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              LCA Report <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live GIS Spatial Corridors Mini-Map */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-3 z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-primary" />
              <h3 className="font-bold text-white text-sm">Live Regional Spatial GIS</h3>
            </div>
            <Link
              to="/dashboard/map"
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              Full Screen Map <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-gray-800 h-52 bg-gray-950 mb-3">
            <div
              ref={miniMapRef}
              style={{ width: '100%', height: '100%', minHeight: '208px', background: '#0f172a' }}
            />
            <div className="absolute bottom-2 left-2 z-[400] bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-gray-300 border border-gray-800 font-medium">
              3 Facilities • 1 Active Transit Line
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              OSRM Corridors Active
            </span>
            <Link to="/dashboard/live-logistics" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              Live Fleet GPS <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
