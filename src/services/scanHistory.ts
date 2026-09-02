/**
 * Small local scan history (last N results).
 * Helps farmers compare plants without needing an account.
 */
import * as FileSystem from 'expo-file-system/legacy';
import type { DiseaseKey } from '../constants/strings';

export type ScanHistoryItem = {
  id: string;
  createdAt: string;
  disease: DiseaseKey;
  confidence: number;
  imageUri: string;
  rejected?: boolean;
};

const MAX_ITEMS = 8;
const DIR = `${FileSystem.documentDirectory}scan-history/`;
const INDEX_FILE = `${DIR}index.json`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

async function readIndex(): Promise<ScanHistoryItem[]> {
  try {
    await ensureDir();
    const info = await FileSystem.getInfoAsync(INDEX_FILE);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(INDEX_FILE);
    const parsed = JSON.parse(raw) as ScanHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(items: ScanHistoryItem[]): Promise<void> {
  await ensureDir();
  await FileSystem.writeAsStringAsync(INDEX_FILE, JSON.stringify(items));
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  return readIndex();
}

export async function clearScanHistory(): Promise<void> {
  try {
    const items = await readIndex();
    await Promise.all(
      items.map(async (item) => {
        try {
          await FileSystem.deleteAsync(item.imageUri, { idempotent: true });
        } catch {
          // ignore
        }
      })
    );
    await writeIndex([]);
  } catch {
    // ignore
  }
}

export async function saveScanToHistory(input: {
  imageUri: string;
  disease: DiseaseKey;
  confidence: number;
  rejected?: boolean;
}): Promise<ScanHistoryItem | null> {
  try {
    // Don't clutter history with rejected junk photos
    if (input.rejected) return null;

    await ensureDir();
    const id = `${Date.now()}`;
    const dest = `${DIR}${id}.jpg`;
    await FileSystem.copyAsync({ from: input.imageUri, to: dest });

    const item: ScanHistoryItem = {
      id,
      createdAt: new Date().toISOString(),
      disease: input.disease,
      confidence: input.confidence,
      imageUri: dest,
      rejected: false,
    };

    const prev = await readIndex();
    const next = [item, ...prev].slice(0, MAX_ITEMS);
    // Delete overflow files
    const kept = new Set(next.map((x) => x.id));
    await Promise.all(
      prev
        .filter((x) => !kept.has(x.id))
        .map(async (old) => {
          try {
            await FileSystem.deleteAsync(old.imageUri, { idempotent: true });
          } catch {
            // ignore
          }
        })
    );
    await writeIndex(next);
    return item;
  } catch {
    return null;
  }
}
