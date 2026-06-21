import { openDB, type IDBPDatabase } from "idb";

export interface QueueItem {
  id: string;
  type: "review" | "civic";
  endpoint: string;
  payload: unknown;
  queuedAt: number;
}

export interface VenueCacheEntry {
  id: string;
  name: string;
  category: string;
  address: string | null;
  city: string | null;
  access_index: number | null;
  score_entrance: number | null;
  score_bathrooms: number | null;
  score_parking: number | null;
  score_staff: number | null;
  score_sensory: number | null;
  review_count: number;
  certified: boolean;
  photos: string[];
  cachedAt: number;
}

interface AccessanaDB {
  queue: {
    key: string;
    value: QueueItem;
  };
  venues: {
    key: string;
    value: VenueCacheEntry;
  };
}

let _db: IDBPDatabase<AccessanaDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AccessanaDB>> {
  if (_db) return _db;
  _db = await openDB<AccessanaDB>("accessana-offline", 1, {
    upgrade(db) {
      db.createObjectStore("queue", { keyPath: "id" });
      db.createObjectStore("venues", { keyPath: "id" });
    },
  });
  return _db;
}

// ── Queue operations ──────────────────────────────────────────

export async function enqueueItem(item: Omit<QueueItem, "id" | "queuedAt">): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.put("queue", { ...item, id, queuedAt: Date.now() });
  return id;
}

export async function getAllQueued(): Promise<QueueItem[]> {
  const db = await getDB();
  return db.getAll("queue");
}

export async function removeQueued(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("queue", id);
}

export async function getQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count("queue");
}

// ── Venue cache operations ────────────────────────────────────

export async function cacheVenue(entry: Omit<VenueCacheEntry, "cachedAt">): Promise<void> {
  const db = await getDB();
  await db.put("venues", { ...entry, cachedAt: Date.now() });
}

export async function getCachedVenue(id: string): Promise<VenueCacheEntry | undefined> {
  const db = await getDB();
  return db.get("venues", id);
}
