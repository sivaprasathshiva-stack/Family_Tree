import type { FamilyData, Person, Relationship, RelationshipType } from './types';
import { getInverseRelationship } from './types';

// Detect if we have a real backend (production) or should use localStorage (dev without API)
const USE_API = import.meta.env.VITE_USE_API === 'true' || window.location.hostname !== 'localhost';

// ─── localStorage helpers ────────────────────────────────────────────
const LS_KEY = 'family-tree-data';

function lsLoad(): FamilyData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FamilyData) : { people: [], relationships: [] };
  } catch { return { people: [], relationships: [] }; }
}

function lsSave(data: FamilyData) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ─── ID generator ────────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── API fetch helpers ───────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Load all data ───────────────────────────────────────────────────
export async function loadData(): Promise<FamilyData> {
  if (!USE_API) return lsLoad();
  try {
    return await apiFetch<FamilyData>('/api/export');
  } catch {
    console.warn('API unavailable, falling back to localStorage');
    return lsLoad();
  }
}

// ─── People ──────────────────────────────────────────────────────────
export async function createPerson(
  data: FamilyData,
  personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: FamilyData; person: Person }> {
  const now = new Date().toISOString();
  const person: Person = { ...personData, id: generateId(), createdAt: now, updatedAt: now };

  if (USE_API) {
    const saved = await apiFetch<Person>('/api/people', { method: 'POST', body: JSON.stringify(person) });
    const newData = { ...data, people: [...data.people, saved] };
    lsSave(newData); // keep localStorage in sync as cache
    return { data: newData, person: saved };
  }

  const newData = { ...data, people: [...data.people, person] };
  lsSave(newData);
  return { data: newData, person };
}

export async function updatePerson(
  data: FamilyData,
  id: string,
  updates: Partial<Omit<Person, 'id' | 'createdAt'>>
): Promise<FamilyData> {
  const now = new Date().toISOString();
  const merged = { ...updates, updatedAt: now };

  if (USE_API) {
    const existing = data.people.find(p => p.id === id)!;
    const full = { ...existing, ...merged };
    await apiFetch<Person>(`/api/people/${id}`, { method: 'PUT', body: JSON.stringify(full) });
  }

  const newData = { ...data, people: data.people.map(p => p.id === id ? { ...p, ...merged } : p) };
  lsSave(newData);
  return newData;
}

export async function deletePerson(data: FamilyData, id: string): Promise<FamilyData> {
  if (USE_API) {
    await apiFetch<void>(`/api/people/${id}`, { method: 'DELETE' });
  }
  const newData = {
    people: data.people.filter(p => p.id !== id),
    relationships: data.relationships.filter(r => r.personId !== id && r.relatedPersonId !== id),
  };
  lsSave(newData);
  return newData;
}

// ─── Relationships ───────────────────────────────────────────────────
export async function addRelationship(
  data: FamilyData,
  personId: string,
  relatedPersonId: string,
  relationshipType: RelationshipType
): Promise<FamilyData> {
  if (personId === relatedPersonId) return data;

  const exists = data.relationships.some(
    r => r.personId === personId && r.relatedPersonId === relatedPersonId && r.relationshipType === relationshipType
  );
  if (exists) return data;

  const now = new Date().toISOString();
  const newRel: Relationship = { id: generateId(), personId, relatedPersonId, relationshipType, createdAt: now };
  const newRels: Relationship[] = [newRel];

  // Auto-inverse
  const relatedPerson = data.people.find(p => p.id === relatedPersonId);
  if (relatedPerson) {
    const inverseType = getInverseRelationship(relationshipType, relatedPerson.gender);
    if (inverseType) {
      const inverseExists = data.relationships.some(
        r => r.personId === relatedPersonId && r.relatedPersonId === personId && r.relationshipType === inverseType
      );
      if (!inverseExists) {
        newRels.push({ id: generateId(), personId: relatedPersonId, relatedPersonId: personId, relationshipType: inverseType, createdAt: now });
      }
    }
  }

  if (USE_API) {
    await Promise.all(newRels.map(rel =>
      apiFetch<Relationship>('/api/relationships', { method: 'POST', body: JSON.stringify(rel) })
    ));
  }

  const newData = { ...data, relationships: [...data.relationships, ...newRels] };
  lsSave(newData);
  return newData;
}

export async function deleteRelationship(data: FamilyData, id: string): Promise<FamilyData> {
  if (USE_API) {
    await apiFetch<void>(`/api/relationships/${id}`, { method: 'DELETE' });
  }
  const newData = { ...data, relationships: data.relationships.filter(r => r.id !== id) };
  lsSave(newData);
  return newData;
}

// ─── Export / Import ─────────────────────────────────────────────────
export function exportToFile(data: FamilyData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<FamilyData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const d = JSON.parse(e.target?.result as string) as FamilyData;
        if (!Array.isArray(d.people) || !Array.isArray(d.relationships)) reject(new Error('Invalid format'));
        else resolve(d);
      } catch { reject(new Error('Could not parse file')); }
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsText(file);
  });
}

export async function importToDb(data: FamilyData): Promise<void> {
  if (!USE_API) { lsSave(data); return; }
  await apiFetch<void>('/api/import', { method: 'POST', body: JSON.stringify(data) });
  lsSave(data);
}
