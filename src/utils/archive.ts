import type { HNSnapshot } from '../types/hn';

const ARCHIVE_BASE = `${import.meta.env.BASE_URL}data/archive`;

export async function fetchArchiveDates(): Promise<string[]> {
  const res = await fetch(`${ARCHIVE_BASE}/index.json`);
  if (!res.ok) return [];
  return res.json() as Promise<string[]>;
}

export async function fetchSnapshotForDate(date: string): Promise<HNSnapshot> {
  const res = await fetch(`${ARCHIVE_BASE}/${date}.json`);
  if (!res.ok) throw new Error(`No archived snapshot for ${date}`);
  return res.json() as Promise<HNSnapshot>;
}

export function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
