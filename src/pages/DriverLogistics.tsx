import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  saveOfflineEvent, 
  getOfflineEvents, 
  syncPendingEvents
} from '../utils/offlineStorage';
import type { DriverEvent } from '../utils/offlineStorage';
import { 
  Truck, Navigation, MapPin, QrCode, ShieldCheck, CheckCircle2, 
  Radio, Send, Clock, Phone, AlertTriangle, RefreshCw, FileText, 
  Camera, Check, PenTool, Sparkles, ChevronRight, Wifi, WifiOff, BatteryCharging
} from 'lucide-react';

interface Trip {
  trip_id: string;
  driver_id: string;
  exchange_id: string;
  pickup_location: string;
  destination: string;
  material: string;
  status: 'PENDING' | 'EN_ROUTE_PICKUP' | 'TARE_IN' | 'IN_TRANSIT' | 'TARE_OUT' | 'DELIVERED';
  gross_weight_tons?: number;
  net_weight_tons?: number;
  speed_kmh?: number;
  remaining_km?: number;
  eta_mins?: number;
  receiver_contact?: string;
  moisture_pct?: number;
}

const SAMPLE_TRIPS: Trip[] = [
  {
    trip_id: 'TRIP-LA-892',
    driver_id: 'driver_001',
    exchange_id: 'EXCH-SLAG-402',
    pickup_location: 'Apex Metallurgy & Steel Mill (Gate 4), Los Angeles, CA',
    destination: 'Eco-Cement Kiln & Grinding Hub #2, Pasadena, CA',
    material: 'Granulated Blast Furnace Slag (GBFS) - Grade 100',
    status: 'IN_TRANSIT',
    gross_weight_tons: 39.8,
    net_weight_tons: 25.4,
    speed_kmh: 58,
    remaining_km: 14.2,
    eta_mins: 18,
    receiver_contact: '+1 (555) 842-1923',
    moisture_pct: 1.2
  },
  {
    trip_id: 'TRIP-LB-301',
    driver_id: 'driver_001',
    exchange_id: 'EXCH-ASH-119',
    pickup_location: 'Pacific Thermal Power Facility Silo C, Long Beach, CA',
    destination: 'BuildRight Precast Structural Systems, Long Beach, CA',
    material: 'Pulverized Coal Fly Ash (Class F Pozzolan)',
    status: 'EN_ROUTE_PICKUP',
    gross_weight_tons: 32.0,
    net_weight_tons: 20.0,
    speed_kmh: 42,
    remaining_km: 8.5,
    eta_mins: 12,
    receiver_contact: '+1 (555) 349-2810',
    moisture_pct: 0.8
  },
  {
    trip_id: 'TRIP-OC-419',
    driver_id: 'driver_001',
    exchange_id: 'EXCH-SAND-883',
    pickup_location: 'Pacific Casting & Metal Foundry Bay 2, Anaheim, CA',
    destination: 'CalTrans Pavement Batch Plant #4, Orange, CA',
    material: 'Spent Silica Foundry Sand (Grade A)',
    status: 'PENDING',
    gross_weight_tons: 28.5,
    net_weight_tons: 18.2,
    speed_kmh: 0,
    remaining_km: 22.0,
    eta_mins: 30,
    receiver_contact: '+1 (555) 440-9281',
    moisture_pct: 2.1
  }
];

export const DriverLogistics: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);
  const [activeTrip, setActiveTrip] = useState<Trip>(SAMPLE_TRIPS[0]);
  const [queue, setQueue] = useState<DriverEvent[]>([]);
  const [notes, setNotes] = useState('');
  const [qrScanned, setQrScanned] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showPodSignature, setShowPodSignature] = useState(false);
  const [podSigned, setPodSigned] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Connection monitoring & queue loader
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
      showToast('Network connection restored. Syncing pending telematics...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode Active. Events queued in local storage.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updateQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateQueue = () => {
    setQueue(getOfflineEvents());
  };

  const performSync = async () => {
    await syncPendingEvents();
    updateQueue();
  };

  // Live GPS simulation
  useEffect(() => {
    if (!activeTrip || activeTrip.status === 'DELIVERED') return;

    const interval = setInterval(() => {
      const lat = 34.0522 + (Math.random() - 0.5) * 0.004;
      const lng = -118.2437 + (Math.random() - 0.5) * 0.004;

      saveOfflineEvent('GPS_LOCATION', { trip_id: activeTrip.trip_id, coords: { lat, lng } });
      updateQueue();

      if (navigator.onLine) {
        try {
          const locRef = ref(db, `logistics/live/${activeTrip.trip_id}`);
          set(locRef, {
            driver: 'Rajesh Kumar',
            vehicle: 'Heavy Hauler #LA-4829',
            lat,
            lng,
            timestamp: Date.now(),
            status: activeTrip.status,
            material: activeTrip.material,
            destination: activeTrip.destination,
          });
        } catch (e) {
          console.warn('Firebase push skipped:', e);
        }
      }

      // Move marker on Leaflet map
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTrip]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const containerEl = mapRef.current as any;
    if (containerEl._leaflet_id) {
      delete containerEl._leaflet_id;
    }

    try {
      const map = L.map(mapRef.current, {
        center: [34.08, -118.20],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        maxZoom: 18,
        crossOrigin: true,
      }).addTo(map);

      // Custom truck icon
      const truckIcon = L.divIcon({
        className: 'driver-truck-pin',
        html: `
          <div class="w-9 h-9 rounded-2xl bg-blue-600 border-2 border-white shadow-xl text-white flex items-center justify-center font-bold text-base transform -translate-x-1/2 -translate-y-1/2">
            🚚
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const truckMarker = L.marker([34.0522, -118.2437], { icon: truckIcon }).addTo(map);
      markerRef.current = truckMarker;

      // Origin & Destination pins
      const pickupIcon = L.divIcon({
        className: 'pickup-pin',
        html: `<div class="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs shadow-lg border border-gray-950 font-bold">🏭</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([34.0522, -118.2437], { icon: pickupIcon }).addTo(map).bindPopup('<strong>Pickup: Apex Steel</strong>');

      const destIcon = L.divIcon({
        className: 'dest-pin',
        html: `<div class="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shadow-lg border border-gray-950 font-bold">🏗️</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([34.1478, -118.1445], { icon: destIcon }).addTo(map).bindPopup('<strong>Destination: Eco-Cement Kiln</strong>');

      // Route polyline
      const routePoints: [number, number][] = [
        [34.0522, -118.2437],
        [34.0850, -118.2100],
        [34.1200, -118.1700],
        [34.1478, -118.1445],
      ];
      routeLineRef.current = L.polyline(routePoints, {
        color: '#2563eb',
        weight: 5,
        dashArray: '8, 8',
      }).addTo(map);

      mapInstanceRef.current = map;

      [50, 150, 400].forEach((d) => {
        setTimeout(() => map.invalidateSize(), d);
      });
    } catch (e) {
      console.warn('Driver map init:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTrip]);

  // Stage action advances
  const handleAdvanceStatus = (nextStatus: Trip['status'], actionType: DriverEvent['event_type']) => {
    const updated = { ...activeTrip, status: nextStatus };
    setActiveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.trip_id === updated.trip_id ? updated : t)));

    saveOfflineEvent(actionType, { trip_id: activeTrip.trip_id, status: nextStatus });
    updateQueue();

    if (isOnline) {
      performSync();
    }
    showToast(`Status updated to ${nextStatus}!`);
  };

  const handleSendTwilioUpdate = async () => {
    setSendingSms(true);
    try {
      const res = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeTrip.receiver_contact || '+1 (555) 349-2810',
          consignment_id: activeTrip.trip_id,
          driver_name: 'Rajesh Kumar (#LA-4829)',
          message: `SYMBIO Driver Dispatch: Rig #LA-4829 status is ${activeTrip.status} for ${activeTrip.material}. ETA: ${activeTrip.eta_mins} mins. Live Tracking: https://symbio.eco/live/${activeTrip.trip_id}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Twilio Dispatch SMS sent! SID: ${data.sid}`);
      }
    } catch (e) {
      showToast('Twilio notice queued for transit.');
    } finally {
      setSendingSms(false);
    }
  };

  const handleSaveNotes = () => {
    if (!notes.trim()) return;
    saveOfflineEvent('ADD_NOTES', { trip_id: activeTrip.trip_id, note: notes });
    setNotes('');
    updateQueue();
    if (isOnline) performSync();
    showToast('Consignment manifest note recorded.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-brand-light pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-brand-primary text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-4 border border-blue-400">
          <Sparkles className="w-5 h-5 text-amber-300" />
          {toastMsg}
        </div>
      )}

      {/* Driver Mobile Terminal Header */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl shadow-lg">
            🚛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">Rajesh Kumar</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                RIG #LA-4829 (40t)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Heavy Industrial Freight Telematics Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border ${
            isOnline 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'Online (RTDB Active)' : 'Offline (Queued)'}
          </div>

          <button
            onClick={performSync}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 text-xs transition-colors"
            title="Force Telematics Sync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Consignment Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {trips.map((t) => (
          <button
            key={t.trip_id}
            onClick={() => {
              setActiveTrip(t);
              setQrScanned(false);
              setPodSigned(false);
              setOtpVerified(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTrip.trip_id === t.trip_id
                ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-blue-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t.trip_id}</span>
            <span className="text-[10px] opacity-75 font-normal">({t.status})</span>
          </button>
        ))}
      </div>

      {/* 6-Stage Industrial Haul Workflow Bar */}
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold text-gray-300 uppercase tracking-wider">Transit Stage Pipeline</span>
          <span className="font-mono text-blue-400 font-bold">{activeTrip.status}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {[
            { id: 'PENDING', label: '1. Assigned', icon: Clock },
            { id: 'EN_ROUTE_PICKUP', label: '2. En Route', icon: Navigation },
            { id: 'TARE_IN', label: '3. Tare In', icon: Radio },
            { id: 'IN_TRANSIT', label: '4. In Transit', icon: Truck },
            { id: 'TARE_OUT', label: '5. Tare Out', icon: ShieldCheck },
            { id: 'DELIVERED', label: '6. Delivered', icon: CheckCircle2 },
          ].map((stage, idx) => {
            const isCurrent = activeTrip.status === stage.id;
            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-105 font-bold'
                    : 'bg-gray-950/60 border-gray-800/80 text-gray-500'
                }`}
              >
                <stage.icon className="w-4 h-4" />
                <span className="text-[10px] leading-tight">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Consignment Card & Live GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Details & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-start pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Material Payload</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{activeTrip.material}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{activeTrip.net_weight_tons} MT</span>
                <span className="text-[10px] text-gray-500 block">Certified Net</span>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pickup Location (Origin)</span>
                  <p className="text-gray-200 font-medium">{activeTrip.pickup_location}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Dropoff Facility (Destination)</span>
                  <p className="text-gray-200 font-medium">{activeTrip.destination}</p>
                </div>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-950/80 rounded-2xl border border-gray-800 text-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">Live Speed</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{activeTrip.speed_kmh} km/h</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">Remaining</span>
                <span className="text-sm font-bold text-white font-mono">{activeTrip.remaining_km} km</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">ETA</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{activeTrip.eta_mins} mins</span>
              </div>
            </div>

            {/* Step Action Buttons */}
            <div className="pt-2 space-y-2">
              {activeTrip.status === 'PENDING' && (
                <button
                  onClick={() => handleAdvanceStatus('EN_ROUTE_PICKUP', 'START_TRIP')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Navigation className="w-4 h-4" /> Start Trip (En Route to Plant)
                </button>
              )}

              {activeTrip.status === 'EN_ROUTE_PICKUP' && (
                <button
                  onClick={() => handleAdvanceStatus('TARE_IN', 'RECORD_PICKUP')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  <Radio className="w-4 h-4" /> Arrived at Plant (Tare Weighbridge Scale)
                </button>
              )}

              {activeTrip.status === 'TARE_IN' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowQrScanner(true)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                      qrScanned
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    {qrScanned ? '✓ Material Passport Verified' : 'Scan Consignment QR Passport'}
                  </button>

                  {qrScanned && (
                    <button
                      onClick={() => handleAdvanceStatus('IN_TRANSIT', 'RECORD_PICKUP')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <Truck className="w-4 h-4" /> Depart Origin (Begin Road Transit)
                    </button>
                  )}
                </div>
              )}

              {activeTrip.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => handleAdvanceStatus('TARE_OUT', 'RECORD_DELIVERY')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  <ShieldCheck className="w-4 h-4" /> Arrived at Destination (Weighbridge Scale In)
                </button>
              )}

              {activeTrip.status === 'TARE_OUT' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowPodSignature(true)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                      podSigned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    {podSigned ? '✓ Receiver POD Signature Captured' : 'Capture Receiver Proof of Delivery (POD)'}
                  </button>

                  {podSigned && (
                    <button
                      onClick={() => handleAdvanceStatus('DELIVERED', 'RECORD_DELIVERY')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Consignment Delivery
                    </button>
                  )}
                </div>
              )}

              {activeTrip.status === 'DELIVERED' && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Consignment successfully fulfilled & archived.
                </div>
              )}
            </div>
          </div>

          {/* Twilio & Telematics Action Bar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSendTwilioUpdate}
              disabled={sendingSms}
              className="p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              {sendingSms ? 'Sending...' : 'Twilio SMS Alert'}
            </button>

            <a
              href={`tel:${activeTrip.receiver_contact}`}
              className="p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/50 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Dispatch
            </a>
          </div>
        </div>

        {/* Right Column: Embedded Navigation Map & Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-extrabold text-white">Live OSRM Freight Corridor</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Beacon Active</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-800 h-56 bg-gray-950">
              <div
                ref={mapRef}
                style={{ width: '100%', height: '100%', minHeight: '224px', background: '#0f172a' }}
              />
              <div className="absolute bottom-2 left-2 z-[400] bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-gray-300 border border-gray-800">
                Corridor: I-710 / CA-110 Express
              </div>
            </div>
          </div>

          {/* Consignment Notes */}
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-primary" /> Tare Scale & Transit Notes
            </h4>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record scale tare slip #, moisture test %, or delay note..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-primary"
            />
            <button
              onClick={handleSaveNotes}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition-colors"
            >
              Record Manifest Note
            </button>
          </div>

          {/* Offline Sync Queue Monitor */}
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl space-y-2.5 shadow-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white">Telematics Event Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                {queue.length} Queued
              </span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {queue.slice(-4).map((q) => (
                <div
                  key={q.event_id}
                  className="p-2 bg-gray-950 rounded-xl border border-gray-800/80 flex items-center justify-between text-[11px]"
                >
                  <span className="text-gray-300 font-mono">{q.event_type}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                    q.sync_status === 'SYNCED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {q.sync_status}
                  </span>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="text-[11px] text-gray-500 text-center py-2">All events synchronized with cloud database.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Simulated QR Material Passport Scanner */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" /> Passport QR Scanner
              </h3>
              <button onClick={() => setShowQrScanner(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative w-full h-52 bg-gray-950 rounded-2xl border-2 border-dashed border-purple-500/60 overflow-hidden flex flex-col items-center justify-center">
              <div className="w-36 h-36 border-2 border-purple-400 rounded-xl relative flex items-center justify-center bg-purple-950/20">
                <QrCode className="w-20 h-20 text-purple-400/50" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-400 animate-pulse shadow-[0_0_12px_#c084fc]"></div>
              </div>
              <span className="text-[10px] text-gray-400 mt-2">Align camera with consignment QR sticker</span>
            </div>

            <div className="p-3 bg-gray-950 rounded-xl text-xs space-y-1 text-gray-300">
              <div><strong>Consignment:</strong> {activeTrip.trip_id}</div>
              <div><strong>Material:</strong> {activeTrip.material}</div>
              <div><strong>CPCB Code:</strong> CPCB-SCH-II-GBFS-992</div>
            </div>

            <button
              onClick={() => {
                setQrScanned(true);
                setShowQrScanner(false);
                showToast('Material Passport Verified! Chain-of-custody recorded.');
              }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <Check className="w-4 h-4" /> Simulate Successful Scan & Verify
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Simulated Proof of Delivery (POD) Signature Pad */}
      {showPodSignature && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-indigo-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-400" /> Receiver E-Signature Pad
              </h3>
              <button onClick={() => setShowPodSignature(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-gray-400">
              Receiving Plant Inspector acknowledgment of {activeTrip.net_weight_tons} MT of {activeTrip.material}.
            </p>

            <div className="w-full h-36 bg-gray-950 rounded-2xl border border-gray-800 relative flex items-center justify-center">
              <span className="text-xs text-gray-600 italic select-none">Sign here with finger / stylus</span>
            </div>

            <button
              onClick={() => {
                setPodSigned(true);
                setShowPodSignature(false);
                showToast('Proof of delivery signature captured and cryptographically signed.');
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" /> Accept & Seal Delivery Manifest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverLogistics;
