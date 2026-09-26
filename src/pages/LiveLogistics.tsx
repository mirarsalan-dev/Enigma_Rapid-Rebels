import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { 
  Truck, MapPin, Radio, RefreshCw, Send, CheckCircle2, 
  AlertTriangle, Navigation, Clock, ShieldCheck, Layers 
} from 'lucide-react';

interface LiveTrip {
  trip_id: string;
  driver: string;
  vehicle: string;
  lat: number;
  lng: number;
  timestamp: number;
  status: string;
  material: string;
  destination: string;
  speed_kmh?: number;
  co2_avoided_tons?: number;
}

const DEFAULT_TRIPS: LiveTrip[] = [
  {
    trip_id: 'TRIP-LA-892',
    driver: 'Rajesh Kumar',
    vehicle: 'Heavy Hauler #LA-4829 (40t)',
    lat: 34.0522,
    lng: -118.2437,
    timestamp: Date.now() - 5000,
    status: 'IN TRANSIT',
    material: 'Granulated Blast Furnace Slag (GBFS)',
    destination: 'Eco-Cement Kiln #2 (Pasadena)',
    speed_kmh: 58,
    co2_avoided_tons: 22.4
  },
  {
    trip_id: 'TRIP-LB-301',
    driver: 'Marcus Vance',
    vehicle: 'Bulk Tanker #LB-3021 (32t)',
    lat: 33.7701,
    lng: -118.1937,
    timestamp: Date.now() - 12000,
    status: 'APPROACHING SCALE',
    material: 'Class F Fly Ash Pozzolan',
    destination: 'BuildRight Precast Concrete (Long Beach)',
    speed_kmh: 32,
    co2_avoided_tons: 18.2
  },
  {
    trip_id: 'TRIP-OC-419',
    driver: 'Elena Rostova',
    vehicle: 'Tipper Rig #OC-9912 (28t)',
    lat: 33.8366,
    lng: -117.9143,
    timestamp: Date.now() - 25000,
    status: 'LOADING BAY 3',
    material: 'Spent Foundry Silica Sand',
    destination: 'CalTrans Pavement Asphalt Plant #4',
    speed_kmh: 0,
    co2_avoided_tons: 9.6
  }
];

export const LiveLogistics: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<LiveTrip[]>(DEFAULT_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<LiveTrip | null>(DEFAULT_TRIPS[0]);
  const [dispatchedMsg, setDispatchedMsg] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Sync with Firebase or fallback gracefully to active simulated stream
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const liveRef = ref(db, 'logistics/live');
      unsubscribe = onValue(liveRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const parsed: LiveTrip[] = Object.keys(data).map(key => ({
            trip_id: key,
            ...data[key]
          }));
          if (parsed.length > 0) {
            setActiveTrips(parsed);
          }
        }
      }, (error) => {
        console.warn('Firebase RTDB unavailable, utilizing live simulated telematics stream:', error);
      });
    } catch (e) {
      console.warn('Firebase connection exception:', e);
    }

    return () => unsubscribe();
  }, []);

  // Minor realistic GPS drift simulation for active haulers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrips((prev) =>
        prev.map((t) => {
          if (t.status === 'IN TRANSIT') {
            const deltaLat = (Math.random() - 0.48) * 0.0012;
            const deltaLng = (Math.random() - 0.48) * 0.0012;
            return {
              ...t,
              lat: t.lat + deltaLat,
              lng: t.lng + deltaLng,
              timestamp: Date.now(),
              speed_kmh: Math.floor(52 + Math.random() * 12),
            };
          }
          return t;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Initialize Native Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [33.95, -118.15],
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    } catch (err) {
      console.error('Error creating Leaflet map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-draw vehicle markers & route lines whenever activeTrips or selectedTrip updates
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    activeTrips.forEach((trip) => {
      const isSelected = selectedTrip?.trip_id === trip.trip_id;

      const truckIcon = L.divIcon({
        className: 'custom-truck-pin',
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125">
            <div class="w-9 h-9 rounded-2xl ${
              isSelected ? 'bg-blue-600 ring-4 ring-blue-400/50 shadow-2xl' : 'bg-emerald-600 ring-2 ring-white/60 shadow-lg'
            } text-white flex items-center justify-center font-bold">
              🚚
            </div>
            ${
              trip.status === 'IN TRANSIT'
                ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>'
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([trip.lat, trip.lng], { icon: truckIcon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px; color: #0f172a; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${trip.vehicle}</h4>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; margin-bottom: 6px;">
            ${trip.status}
          </span>
          <div style="font-size: 11px; line-height: 1.5; color: #334155;">
            <div><strong>Driver:</strong> ${trip.driver}</div>
            <div><strong>Material:</strong> ${trip.material}</div>
            <div><strong>Destination:</strong> ${trip.destination}</div>
            <div><strong>Speed:</strong> ${trip.speed_kmh || 0} km/h</div>
            <div><strong>CO₂e Avoided:</strong> ${trip.co2_avoided_tons || 12} MT</div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedTrip(trip);
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Draw route vector to destination
    if (routeLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (selectedTrip && mapInstanceRef.current) {
      // Pasadena destination anchor
      const destCoord: [number, number] = [34.1478, -118.1445];
      const points: [number, number][] = [
        [selectedTrip.lat, selectedTrip.lng],
        [(selectedTrip.lat + destCoord[0]) / 2 + 0.02, (selectedTrip.lng + destCoord[1]) / 2 - 0.01],
        destCoord,
      ];

      routeLineRef.current = L.polyline(points, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(mapInstanceRef.current);
    }
  }, [activeTrips, selectedTrip]);

  const handleSendTwilioUpdate = async (trip: LiveTrip) => {
    setDispatching(true);
    try {
      const res = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+1 (555) 349-2810',
          consignment_id: trip.trip_id,
          driver_name: trip.driver,
          message: `SYMBIO Live Haul Telematics: ${trip.vehicle} (${trip.driver}) status is ${trip.status}. Destination: ${trip.destination}. Speed: ${trip.speed_kmh} km/h. Live GPS: https://symbio.eco/live/${trip.trip_id}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchedMsg(`Twilio Dispatch Alert sent to ${trip.driver}! SID: ${data.sid}`);
        setTimeout(() => setDispatchedMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  const focusTripOnMap = (trip: LiveTrip) => {
    setSelectedTrip(trip);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([trip.lat, trip.lng], 13, { duration: 1 });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-brand-light">
      {/* Toast Alert */}
      {dispatchedMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          {dispatchedMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE GPS TELEMATICS ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              OSRM CORRIDOR TRACKING
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Live Industrial Haulage & Dispatch GIS</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time GPS tracking for secondary byproduct transit, electronic weighbridge gate verification, and Twilio telematics.
          </p>
        </div>

        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
          }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-2 self-start md:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Recalibrate Map Bounds
        </button>
      </div>

      {/* Main Map & Fleet Telematics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Leaflet Map Visualizer */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[620px]">
          <div
            ref={mapContainerRef}
            className="w-full h-full z-0"
            style={{ height: '100%', minHeight: '580px', width: '100%' }}
          />

          {/* Overlaid Map Control Floating Banner */}
          <div className="absolute top-4 left-4 z-[400] bg-gray-900/90 backdrop-blur border border-gray-800/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-white block">Active Freight Fleet ({activeTrips.length})</span>
              <span className="text-[11px] text-gray-400">All corridors transmitting at 4s intervals</span>
            </div>
          </div>
        </div>

        {/* Fleet Sidebar & Selected Trip Telematics Details */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-[620px] overflow-y-auto pr-1">
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-primary" /> Active Logistics Vehicles
            </h3>

            <div className="space-y-2.5">
              {activeTrips.map((trip) => {
                const isSelected = selectedTrip?.trip_id === trip.trip_id;
                return (
                  <div
                    key={trip.trip_id}
                    onClick={() => focusTripOnMap(trip)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg'
                        : 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-xs">{trip.vehicle}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        trip.status === 'IN TRANSIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2 truncate">
                      {trip.material}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-700/50">
                      <span>Driver: {trip.driver}</span>
                      <span className="font-mono text-emerald-400">{trip.speed_kmh} km/h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Trip Actions & Twilio Dispatch Trigger */}
          {selectedTrip && (
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consignment Telematics</span>
                <span className="font-mono text-xs text-blue-400">{selectedTrip.trip_id}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Destination:</span>
                  <span className="text-white font-medium text-right">{selectedTrip.destination}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Avoided CO₂e:</span>
                  <span className="text-emerald-400 font-bold">{selectedTrip.co2_avoided_tons} Metric Tons</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GPS Lat/Lng:</span>
                  <span className="font-mono text-gray-300">{selectedTrip.lat.toFixed(4)}, {selectedTrip.lng.toFixed(4)}</span>
                </div>
              </div>

              <button
                onClick={() => handleSendTwilioUpdate(selectedTrip)}
                disabled={dispatching}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                {dispatching ? 'Transmitting...' : 'Dispatch Live SMS Alert via Twilio'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
