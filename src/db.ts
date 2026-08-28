import { createEmptyData } from './domain';
import type { AppData } from './types';

const REAL_DB_NAME = 'low-energy-menu';
const DEMO_DB_NAME = 'low-energy-menu-demo';
const STORE = 'app';
const KEY = 'state';
let databaseName = REAL_DB_NAME;

export function useDemoStorage(enabled: boolean): void {
  databaseName = enabled ? DEMO_DB_NAME : REAL_DB_NAME;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local storage.'));
  });
}

export async function loadData(fallback: () => AppData = createEmptyData): Promise<AppData> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve((request.result as AppData | undefined) || fallback());
    request.onerror = () => reject(request.error || new Error('Could not read your plan.'));
    transaction.oncomplete = () => database.close();
  });
}

export async function saveData(data: AppData): Promise<void> {
  data.updatedAt = new Date().toISOString();
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(data, KEY);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error || new Error('Could not save your plan.'));
  });
}

export async function eraseData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Could not erase local data.'));
  });
}
