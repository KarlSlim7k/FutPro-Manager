/**
 * Native IndexedDB store for offline referee match operations in FutPro Manager.
 * Designed to work without network in rural and amateur pitches.
 */

export type OfflineMatchEvent = {
  id: string; // client-generated uuid or timestamp
  matchId: string;
  teamId?: string | null;
  playerId?: string | null;
  eventType: string;
  minute?: number | null;
  notes?: string | null;
  createdAt: string;
  synced: boolean;
};

export type OfflineMatchScore = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: string;
  updatedAt: string;
  synced: boolean;
};

const DB_NAME = "futpro_offline_db";
const DB_VERSION = 1;
const EVENTS_STORE = "offline_events";
const SCORES_STORE = "offline_scores";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB no disponible en este entorno."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const eventStore = db.createObjectStore(EVENTS_STORE, { keyPath: "id" });
        eventStore.createIndex("matchId", "matchId", { unique: false });
        eventStore.createIndex("synced", "synced", { unique: false });
      }
      if (!db.objectStoreNames.contains(SCORES_STORE)) {
        db.createObjectStore(SCORES_STORE, { keyPath: "matchId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineEvent(event: Omit<OfflineMatchEvent, "synced">): Promise<OfflineMatchEvent> {
  const db = await openDb();
  const record: OfflineMatchEvent = { ...event, synced: false };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    const store = tx.objectStore(EVENTS_STORE);
    const req = store.put(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getUnsyncedEvents(matchId?: string): Promise<OfflineMatchEvent[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const store = tx.objectStore(EVENTS_STORE);
    const req = store.getAll();

    req.onsuccess = () => {
      let all: OfflineMatchEvent[] = req.result || [];
      all = all.filter((e) => !e.synced);
      if (matchId) {
        all = all.filter((e) => e.matchId === matchId);
      }
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markEventAsSynced(id: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    const store = tx.objectStore(EVENTS_STORE);
    const req = store.get(id);

    req.onsuccess = () => {
      const record = req.result as OfflineMatchEvent | undefined;
      if (record) {
        record.synced = true;
        store.put(record);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineScore(score: Omit<OfflineMatchScore, "synced">): Promise<OfflineMatchScore> {
  const db = await openDb();
  const record: OfflineMatchScore = { ...score, synced: false };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(SCORES_STORE, "readwrite");
    const store = tx.objectStore(SCORES_STORE);
    const req = store.put(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getUnsyncedScore(matchId: string): Promise<OfflineMatchScore | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(SCORES_STORE, "readonly");
    const store = tx.objectStore(SCORES_STORE);
    const req = store.get(matchId);

    req.onsuccess = () => {
      const record = req.result as OfflineMatchScore | undefined;
      if (record && !record.synced) {
        resolve(record);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markScoreAsSynced(matchId: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(SCORES_STORE, "readwrite");
    const store = tx.objectStore(SCORES_STORE);
    const req = store.get(matchId);

    req.onsuccess = () => {
      const record = req.result as OfflineMatchScore | undefined;
      if (record) {
        record.synced = true;
        store.put(record);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllOfflineSynced(): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([EVENTS_STORE, SCORES_STORE], "readwrite");
    const eventStore = tx.objectStore(EVENTS_STORE);
    const scoreStore = tx.objectStore(SCORES_STORE);

    // Get all events and delete synced
    const reqEvents = eventStore.getAll();
    reqEvents.onsuccess = () => {
      const events = (reqEvents.result || []) as OfflineMatchEvent[];
      events.forEach((e) => {
        if (e.synced) eventStore.delete(e.id);
      });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
