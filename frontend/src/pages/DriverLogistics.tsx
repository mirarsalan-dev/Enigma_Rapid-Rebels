import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import { 
  saveOfflineEvent, 
  getOfflineEvents, 
  syncPendingEvents
} from '../utils/offlineStorage';
import type { DriverEvent } from '../utils/offlineStorage';

// Mock Trip Interface
interface Trip {
  trip_id: string;
  driver_id: string;
  exchange_id: string;
  pickup_location: string;
  destination: string;
  material: string;
  status: string;
}

const DriverLogistics: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [queue, setQueue] = useState<DriverEvent[]>([]);
  const [notes, setNotes] = useState("");
  const [qrScanned, setQrScanned] = useState(false);

  const driverId = "driver_001"; // Mock authenticated driver ID

  useEffect(() => {
    // Check connection status
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load of cached/remote trip
    loadTrip();
    updateQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live GPS Simulator
  useEffect(() => {
    let interval: any;
    if (trip && trip.status !== 'PENDING' && trip.status !== 'DELIVERED') {
      interval = setInterval(() => {
        const lat = 34.0522 + (Math.random() - 0.5) * 0.01;
        const lng = -118.2437 + (Math.random() - 0.5) * 0.01;
        
        // Always save to offline event queue for history/sync
        saveOfflineEvent('GPS_LOCATION', { trip_id: trip.trip_id, coords: { lat, lng } });
        updateQueue(); // update UI queue
        
        // If online, also update the Live RTDB node for the dashboard
        if (navigator.onLine) {
          const locRef = ref(db, `logistics/live/${trip.trip_id}`);
          set(locRef, {
            driver: driverId,
            vehicle: "Truck-A12",
            lat,
            lng,
            timestamp: Date.now(),
            status: trip.status,
            material: trip.material,
            destination: trip.destination,
          }).catch(err => console.error("Firebase write error:", err));
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [trip, isOnline]);

  const loadTrip = async () => {
    // Try to fetch from backend if online
    if (navigator.onLine) {
      try {
        const res = await fetch(`http://localhost:8000/api/drivers/trips/${driverId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setTrip(data[0]);
          localStorage.setItem('cached_trip', JSON.stringify(data[0]));
        }
      } catch (err) {
        console.error("Failed to load trips", err);
        loadCachedTrip();
      }
    } else {
      loadCachedTrip();
    }
  };

  const loadCachedTrip = () => {
    const cached = localStorage.getItem('cached_trip');
    if (cached) {
      setTrip(JSON.parse(cached));
    }
  };

  const updateQueue = () => {
    setQueue(getOfflineEvents());
  };

  const performSync = async () => {
    await syncPendingEvents();
    updateQueue();
  };

  const handleAction = (actionType: 'START_TRIP' | 'RECORD_PICKUP' | 'RECORD_DELIVERY') => {
    if (!trip) return;
    
    // Add to local queue
    saveOfflineEvent(actionType, { trip_id: trip.trip_id });
    
    // Update local trip status optimally
    let newStatus = trip.status;
    if (actionType === 'START_TRIP') newStatus = 'EN_ROUTE_PICKUP';
    if (actionType === 'RECORD_PICKUP') newStatus = 'IN_TRANSIT';
    if (actionType === 'RECORD_DELIVERY') newStatus = 'DELIVERED';
    
    const updatedTrip = { ...trip, status: newStatus };
    setTrip(updatedTrip);
    localStorage.setItem('cached_trip', JSON.stringify(updatedTrip));
    
    updateQueue();
    if (isOnline) {
      performSync();
    }
  };

  const handleAddNote = () => {
    if (!notes.trim() || !trip) return;
    saveOfflineEvent('ADD_NOTES', { trip_id: trip.trip_id, note: notes });
    setNotes("");
    updateQueue();
    if (isOnline) performSync();
  };

  const captureGPS = () => {
    if (!trip) return;
    // Mocking GPS coordinates
    const coords = { lat: 34.0522, lng: -118.2437 };
    saveOfflineEvent('GPS_LOCATION', { trip_id: trip.trip_id, coords });
    updateQueue();
    if (isOnline) performSync();
    alert("GPS Location captured & queued!");
  };

  const scanQR = () => {
    setQrScanned(true);
    alert("Material Passport QR Scanned & Verified!");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>SYMBIO Driver</h1>
        <div style={isOnline ? styles.onlineBadge : styles.offlineBadge}>
          {isOnline ? 'Online' : 'Offline — changes will sync when connection returns.'}
        </div>
      </header>

      <main style={styles.main}>
        {trip ? (
          <div style={styles.tripCard}>
            <h2>Assigned Pickup: {trip.status}</h2>
            
            <div style={styles.detailGroup}>
              <strong>Material:</strong> {trip.material}
              {!qrScanned && (
                <button onClick={scanQR} style={styles.scanBtn}>Scan Material Passport QR</button>
              )}
              {qrScanned && <span style={{color: 'green', marginLeft: '10px'}}>✓ Verified</span>}
            </div>

            <div style={styles.detailGroup}>
              <strong>Pickup Location:</strong><br />
              {trip.pickup_location}
            </div>

            <div style={styles.detailGroup}>
              <strong>Destination:</strong><br />
              {trip.destination}
            </div>

            <div style={styles.actions}>
              {trip.status === 'PENDING' && (
                <button onClick={() => handleAction('START_TRIP')} style={styles.primaryBtn}>Start Trip</button>
              )}
              {trip.status === 'EN_ROUTE_PICKUP' && (
                <button onClick={() => handleAction('RECORD_PICKUP')} style={styles.primaryBtn}>Record Pickup</button>
              )}
              {trip.status === 'IN_TRANSIT' && (
                <button onClick={() => handleAction('RECORD_DELIVERY')} style={styles.primaryBtn}>Record Delivery</button>
              )}
            </div>
            
            <div style={styles.gpsGroup}>
              <button onClick={captureGPS} style={styles.secondaryBtn}>Send GPS Location</button>
              <button style={styles.secondaryBtn} onClick={() => alert("Mock Map View logic here.")}>View Route</button>
            </div>

            <div style={styles.notesGroup}>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="Add delivery/pickup notes..."
                style={styles.textArea}
              />
              <button onClick={handleAddNote} style={styles.secondaryBtn}>Save Note</button>
            </div>
          </div>
        ) : (
          <p>No trip assigned or loading...</p>
        )}

        <div style={styles.syncQueue}>
          <h3>Sync Queue ({queue.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {queue.map(q => (
              <li key={q.event_id} style={styles.queueItem(q.sync_status)}>
                {q.event_type} - {q.sync_status}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Inter, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  },
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px'
  },
  onlineBadge: {
    backgroundColor: '#10b981',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  offlineBadge: {
    backgroundColor: '#ef4444',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  main: {
    padding: '1rem',
    flex: 1
  },
  tripCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem'
  },
  detailGroup: {
    marginBottom: '1rem',
    fontSize: '1rem',
    color: '#374151'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '1.5rem'
  },
  primaryBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  secondaryBtn: {
    padding: '8px 12px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  gpsGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '1rem'
  },
  scanBtn: {
    marginLeft: '10px',
    padding: '4px 8px',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  notesGroup: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  textArea: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    minHeight: '60px'
  },
  syncQueue: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  queueItem: (status: string) => ({
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
    color: status === 'SYNCED' ? '#10b981' : (status === 'SYNCING' ? '#f59e0b' : '#6b7280'),
    fontSize: '0.9rem'
  })
};

export default DriverLogistics;
