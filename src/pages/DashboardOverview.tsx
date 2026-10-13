import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, ArrowUpRight, ArrowDownRight, Layers, Database, ShieldCheck, 
  ChevronRight, Activity, MapPin, Truck, ExternalLink, 
  RefreshCw, Compass, Plus, TrendingUp, CheckCircle2, AlertTriangle,
  ArrowRight, BarChart3, Building2, Check, Clock
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

  // Initialize live overview mini-map with clean enterprise styling
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
        center: [34.08, -118.20],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Reliable OpenStreetMap Layer (No API Key Required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true,
      }).addTo(map);

      // Clean enterprise pins
      const locations = [
        { name: 'Apex Metallurgy (Generator)', lat: 34.0522, lng: -118.2437, type: 'navy', label: 'GEN' },
        { name: 'Eco-Cement Kiln #2 (Processor)', lat: 34.1478, lng: -118.1445, type: 'teal', label: 'PROC' },
        { name: 'BuildRight Precast (Sink)', lat: 33.7701, lng: -118.1937, type: 'green', label: 'RCV' },
      ];

      locations.forEach(loc => {
        const bgClass = loc.type === 'navy' ? 'bg-[#0B1F5B]' : loc.type === 'teal' ? 'bg-[#2FA7A0]' : 'bg-[#4FAE7B]';
        const pinIcon = L.divIcon({
          className: 'custom-esg-pin',
          html: `<div class="${bgClass} text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow border border-white flex items-center justify-center">${loc.label}</div>`,
          iconSize: [36, 18],
          iconAnchor: [18, 9],
        });
        L.marker([loc.lat, loc.lng], { icon: pinIcon }).addTo(map).bindPopup(`
          <div class="p-1">
            <p class="font-bold text-xs text-[#0B1F5B]">${loc.name}</p>
            <p class="text-[11px] text-[#64748B] mt-0.5">Verified Industrial Stream Node</p>
          </div>
        `);
      });

      // Route Corridor
      L.polyline([[34.0522, -118.2437], [34.1478, -118.1445]], {
        color: '#0B1F5B',
        weight: 2.5,
        opacity: 0.8,
        dashArray: '4, 4',
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
    <div className="space-y-6">
      {/* Page Header / Summary Banner */}
      <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-6 rounded-card shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold text-[#0B1F5B] dark:text-[#5EEADF]">Apex Metallurgy & Industrial Cluster</span>
            <span>·</span>
            <span>Reporting Period: Q3 FY2026</span>
            <span>·</span>
            <span className="text-[#2FA7A0] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ISO 14044 & CPCB Audited
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F5B] dark:text-white">
            Sustainability & Circular Resource Intelligence
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Real-time mass-balance telematics, byproduct valorization loops, and certified carbon abatement metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/twilio"
            className="px-3.5 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-btn text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse"></span>
            <span>Twilio Telephony (+919869108305)</span>
          </Link>
          <Link
            to="/dashboard/map"
            className="px-3.5 py-2 bg-white dark:bg-[#0D1B2A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E2E44] text-[#172554] dark:text-white border border-[#E2E8F0] dark:border-[#1E2E44] rounded-btn text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#2FA7A0]" />
            <span>GIS Map</span>
          </Link>
          <Link
            to="/dashboard/marketplace"
            className="px-3.5 py-2 bg-[#0B1F5B] hover:bg-[#07163F] text-white rounded-btn text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Material Surplus</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (Section 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Sustainability Score */}
        <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Overall ESG Score</span>
            <span className="p-1.5 rounded-md bg-[#F0FDFB] dark:bg-[#175B57]/30 text-[#2FA7A0]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-[#0B1F5B] dark:text-white">84</span>
              <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">/ 100</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4FAE7B]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+3.2 pts vs last quarter</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E2E44] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Environmental: 88 · Circularity: 85
          </div>
        </div>

        {/* KPI 2: Avoided Carbon Emissions */}
        <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Carbon Avoidance</span>
            <span className="p-1.5 rounded-md bg-[#F2FDF6] dark:bg-[#236140]/30 text-[#4FAE7B]">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-[#0B1F5B] dark:text-white">
                {loading ? '...' : (metrics?.co2_saved_tonnes || 450.5).toLocaleString()}
              </span>
              <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">tCO₂e</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4FAE7B]">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>↓ 18.4% Scope 3 emissions</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E2E44] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            ASTM C989 clinker displacement factor
          </div>
        </div>

        {/* KPI 3: Landfill Waste Diversion */}
        <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Landfill Diversion Rate</span>
            <span className="p-1.5 rounded-md bg-[#F0FDFB] dark:bg-[#175B57]/30 text-[#2FA7A0]">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-[#0B1F5B] dark:text-white">76.2%</span>
              <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">(31,800 t)</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4FAE7B]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Target: 85% by FY2027</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E2E44] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Zero-landfill compliance certified
          </div>
        </div>

        {/* KPI 4: Active Byproduct Surplus */}
        <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Live Marketplace Stream</span>
            <span className="p-1.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E2E44] text-[#0B1F5B] dark:text-[#94BAFF]">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-[#0B1F5B] dark:text-white">
                {loading ? '...' : (metrics?.live_surplus_tonnes || 8200).toLocaleString()}
              </span>
              <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">t</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#2FA7A0]">
              <Activity className="w-3.5 h-3.5" />
              <span>96.4% circular loop retention</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E2E44] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Across {(metrics?.observed_companies || 13466).toLocaleString()} verified facilities
          </div>
        </div>
      </div>

      {/* Main Grid: Active Exchanges & Geospatial Corridor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Active Consignment Stream & Score Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Consignment Stream */}
          <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-5 shadow-subtle space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] dark:border-[#1E2E44]">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F5B] dark:text-white">Active Industrial Consignment Dispatches</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">Live freight corridors & weighbridge verified transfers</p>
              </div>
              <Link to="/dashboard/exchanges" className="text-xs font-semibold text-[#0B1F5B] dark:text-[#5EEADF] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'EXCH-SLAG-402',
                  material: 'Granulated Blast Furnace Slag (GBFS Grade 100)',
                  origin: 'Apex Metallurgy',
                  dest: 'Eco-Cement Kiln #2',
                  volume: '1,800 t',
                  status: 'IN TRANSIT',
                  badgeClass: 'bg-[#F0FDFB] text-[#175B57] border-[#CCFBF7]',
                  eta: '35 min remaining',
                },
                {
                  id: 'EXCH-ASH-119',
                  material: 'Class F Pulverized Fly Ash Pozzolan',
                  origin: 'Pacific Thermal Power Facility',
                  dest: 'BuildRight Precast Structural',
                  volume: '1,200 t',
                  status: 'DISPATCHED',
                  badgeClass: 'bg-[#F2FDF6] text-[#236140] border-[#DCFCE8]',
                  eta: 'At weighbridge tare',
                },
                {
                  id: 'EXCH-SAND-883',
                  material: 'Spent Silica Foundry Sand (Fractionated)',
                  origin: 'Pacific Casting & Foundry',
                  dest: 'CalTrans Batch Plant #4',
                  volume: '950 t',
                  status: 'TARE VERIFIED',
                  badgeClass: 'bg-[#FEF9EE] text-[#D6A43A] border-[#F6E4BA]',
                  eta: 'Manifest CPCB confirmed',
                },
              ].map((ex) => (
                <div key={ex.id} className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0B1F5B] dark:text-white">{ex.material}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${ex.badgeClass}`}>
                        {ex.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {ex.origin} ➔ {ex.dest}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#0B1F5B] dark:text-white font-mono block">{ex.volume}</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{ex.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 12: Strategy Trackers */}
          <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-5 shadow-subtle space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9] dark:border-[#1E2E44]">
              <h3 className="text-sm font-bold text-[#0B1F5B] dark:text-white">Corporate ESG & Circularity Targets (2026–2027)</h3>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">3 Active Objectives</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E2E44] bg-[#F8FAFC] dark:bg-[#0D1B2A] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Strategy #01</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#F2FDF6] text-[#236140]">ON TRACK</span>
                </div>
                <h4 className="text-xs font-bold text-[#0B1F5B] dark:text-white">Zero Landfill Diversion</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>Current: 76.2%</span>
                    <span>Target: 85%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1E2E44] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#4FAE7B] h-full rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E2E44] bg-[#F8FAFC] dark:bg-[#0D1B2A] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Strategy #02</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#F0FDFB] text-[#175B57]">ACTIVE</span>
                </div>
                <h4 className="text-xs font-bold text-[#0B1F5B] dark:text-white">Clinker Replacement</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>Current: 32%</span>
                    <span>Target: 40%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1E2E44] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2FA7A0] h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E2E44] bg-[#F8FAFC] dark:bg-[#0D1B2A] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Strategy #03</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#FEF9EE] text-[#D6A43A]">MONITOR</span>
                </div>
                <h4 className="text-xs font-bold text-[#0B1F5B] dark:text-white">Reverse Logistics Load</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>Current: 84%</span>
                    <span>Target: 90%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1E2E44] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0B1F5B] dark:bg-[#5EEADF] h-full rounded-full" style={{ width: '93%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: GIS Spatial Corridor & Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          {/* GIS Regional Spatial Corridor */}
          <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-5 shadow-subtle space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#0B1F5B] dark:text-white text-xs">Regional Industrial GIS Corridor</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Los Angeles Basin · Cluster #4</p>
              </div>
              <Link to="/dashboard/map" className="text-xs font-semibold text-[#0B1F5B] dark:text-[#5EEADF] hover:underline flex items-center gap-1">
                Full GIS Map <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] dark:border-[#1E2E44] h-60 bg-[#F8FAFC]">
              <div
                ref={miniMapRef}
                style={{ width: '100%', height: '100%', minHeight: '240px' }}
              />
              <div className="absolute bottom-2 left-2 z-[400] bg-white/95 dark:bg-[#0A1626]/95 backdrop-blur px-2.5 py-1 rounded text-[10px] text-[#172554] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E2E44] shadow-sm">
                3 Facilities · 1 Active Transit Line
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
              <span>OSRM freight haulage route active</span>
              <Link to="/dashboard/live-logistics" className="text-[#0B1F5B] dark:text-[#5EEADF] hover:underline font-semibold">
                Live Fleet GPS
              </Link>
            </div>
          </div>

          {/* Section 11: Intelligent ESG Recommendations */}
          <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-5 shadow-subtle space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9] dark:border-[#1E2E44]">
              <h3 className="text-xs font-bold text-[#0B1F5B] dark:text-white uppercase tracking-wider">
                Priority Action Recommendations
              </h3>
              <span className="text-[10px] font-semibold text-[#2FA7A0]">AI Match Engine</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#0B1F5B] dark:text-white">
                    1. Granulated Slag Kiln Optimization
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#4FAE7B]">$18.4k/mo</span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                  Route 1,800t GBFS monthly to Eco-Cement Kiln #2 for ASTM C989 pozzolanic binder replacement.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-[#4FAE7B] font-medium">↓ 450.5 MT CO₂e avoided</span>
                  <Link to="/dashboard/opportunities" className="text-[11px] font-semibold text-[#0B1F5B] dark:text-[#5EEADF] hover:underline">
                    View Action →
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#0B1F5B] dark:text-white">
                    2. Class F Fly Ash Precast Sourcing
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#4FAE7B]">$12.9k/mo</span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                  Connect Pacific Thermal surplus to BuildRight Precast structural mix.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-[#4FAE7B] font-medium">↓ 320.0 MT CO₂e avoided</span>
                  <Link to="/dashboard/opportunities" className="text-[11px] font-semibold text-[#0B1F5B] dark:text-[#5EEADF] hover:underline">
                    View Action →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
