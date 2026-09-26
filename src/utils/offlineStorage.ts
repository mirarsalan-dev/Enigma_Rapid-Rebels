// Simple offline storage using localStorage to simulate SQLite/IndexedDB event queue for demo purposes.

export interface DriverEvent {
  event_id: string;
  device_id: string;
  timestamp: string;
  event_type: 'START_TRIP' | 'RECORD_PICKUP' | 'RECORD_DELIVERY' | 'ADD_NOTES' | 'GPS_LOCATION';
  payload: any;
  sync_status: 'PENDING' | 'SYNCING' | 'SYNCED';
}

const EVENTS_KEY = 'symbio_driver_events';
const DEVICE_ID = 'dev_' + Math.random().toString(36).substring(2, 9); // mock device id

export const getOfflineEvents = (): DriverEvent[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOfflineEvent = (
  eventType: DriverEvent['event_type'], 
  payload: any
): DriverEvent => {
  const events = getOfflineEvents();
  
  const newEvent: DriverEvent = {
    event_id: 'evt_' + Math.random().toString(36).substring(2, 9),
    device_id: DEVICE_ID,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    payload,
    sync_status: 'PENDING'
  };
  
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
};

export const updateEventStatus = (eventId: string, status: DriverEvent['sync_status']) => {
  const events = getOfflineEvents();
  const eventIndex = events.findIndex(e => e.event_id === eventId);
  if (eventIndex !== -1) {
    events[eventIndex].sync_status = status;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
};

export const clearSyncedEvents = () => {
  const events = getOfflineEvents().filter(e => e.sync_status !== 'SYNCED');
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};

export const syncPendingEvents = async () => {
  const events = getOfflineEvents().filter(e => e.sync_status === 'PENDING');
  
  if (events.length === 0) return 0;
  
  // Mark as syncing
  events.forEach(e => updateEventStatus(e.event_id, 'SYNCING'));
  
  try {
    const res = await fetch('/api/drivers/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });
    
    if (res.ok) {
      events.forEach(e => updateEventStatus(e.event_id, 'SYNCED'));
      // Wait a moment then clear synced for cleanup
      setTimeout(clearSyncedEvents, 2000);
      return events.length;
    } else {
      // Revert to pending on failure
      events.forEach(e => updateEventStatus(e.event_id, 'PENDING'));
      return 0;
    }
  } catch (error) {
    console.error("Sync failed, will retry later:", error);
    events.forEach(e => updateEventStatus(e.event_id, 'PENDING'));
    return 0;
  }
};
