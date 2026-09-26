import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

// Fix leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
}

export const LiveLogistics: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<LiveTrip[]>([]);

  useEffect(() => {
    const liveRef = ref(db, 'logistics/live');
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: LiveTrip[] = Object.keys(data).map(key => ({
          trip_id: key,
          ...data[key]
        }));
        setActiveTrips(parsed);
      } else {
        setActiveTrips([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateETA = (lat: number, lng: number) => {
    // Mock ETA calculation based on random factor for demo
    return `${Math.floor(Math.random() * 45) + 15} mins`;
  };

  const isOffline = (timestamp: number) => {
    // Consider offline if no update in the last 30 seconds
    return (Date.now() - timestamp) > 30000;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Logistics Tracking</h1>
          <p className="text-gray-500">Real-time owner dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 z-0 relative">
          <MapContainer 
            center={[34.0522, -118.2437]} 
            zoom={12} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeTrips.map(trip => (
              <Marker key={trip.trip_id} position={[trip.lat, trip.lng]}>
                <Popup>
                  <strong>Driver: {trip.driver}</strong><br/>
                  Vehicle: {trip.vehicle}<br/>
                  Material: {trip.material}<br/>
                  Status: {trip.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar / List Section */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Deliveries ({activeTrips.length})</h2>
          
          <div className="space-y-4">
            {activeTrips.map(trip => {
              const offline = isOffline(trip.timestamp);
              
              return (
                <div key={trip.trip_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{trip.vehicle}</h3>
                    {offline ? (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                        Last Known Location
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-700">Driver:</span> {trip.driver}</p>
                    <p><span className="font-medium text-gray-700">Material:</span> {trip.material}</p>
                    <p><span className="font-medium text-gray-700">Destination:</span> {trip.destination}</p>
                    <p><span className="font-medium text-gray-700">Status:</span> {trip.status}</p>
                    <p><span className="font-medium text-gray-700">ETA:</span> {calculateETA(trip.lat, trip.lng)}</p>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Last Update: {new Date(trip.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {activeTrips.length === 0 && (
              <p className="text-gray-500 text-center py-8">No active trips currently in transit.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
