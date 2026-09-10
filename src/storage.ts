import type { FamilyData, Person, Relationship, RelationshipType } from './types';
import { getInverseRelationship } from './types';

const STORAGE_KEY = 'family-tree-data';

export function loadData(): FamilyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { people: [], relationships: [] };
    return JSON.parse(raw) as FamilyData;
  } catch {
    return { people: [], relationships: [] };
  }
}

export function saveData(data: FamilyData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data: FamilyData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<FamilyData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as FamilyData;
        if (!Array.isArray(data.people) || !Array.isArray(data.relationships)) {
          reject(new Error('Invalid file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Could not parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createPerson(data: FamilyData, person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): { data: FamilyData; person: Person } {
  const now = new Date().toISOString();
  const newPerson: Person = { ...person, id: generateId(), createdAt: now, updatedAt: now };
  const newData = { ...data, people: [...data.people, newPerson] };
  saveData(newData);
  return { data: newData, person: newPerson };
}

export function updatePerson(data: FamilyData, id: string, updates: Partial<Person>): FamilyData {
  const now = new Date().toISOString();
  const newData = {
    ...data,
    people: data.people.map(p => p.id === id ? { ...p, ...updates, updatedAt: now } : p),
  };
  saveData(newData);
  return newData;
}

export function deletePerson(data: FamilyData, id: string): FamilyData {
  const newData = {
    people: data.people.filter(p => p.id !== id),
    relationships: data.relationships.filter(r => r.personId !== id && r.relatedPersonId !== id),
  };
  saveData(newData);
  return newData;
}

export function addRelationship(
  data: FamilyData,
  personId: string,
  relatedPersonId: string,
  relationshipType: RelationshipType,
): FamilyData {
  if (personId === relatedPersonId) return data;

  const exists = data.relationships.some(
    r => r.personId === personId && r.relatedPersonId === relatedPersonId && r.relationshipType === relationshipType
  );
  if (exists) return data;

  const now = new Date().toISOString();
  const newRel: Relationship = { id: generateId(), personId, relatedPersonId, relationshipType, createdAt: now };
  const newRels: Relationship[] = [newRel];

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

  const newData = { ...data, relationships: [...data.relationships, ...newRels] };
  saveData(newData);
  return newData;
}

export function deleteRelationship(data: FamilyData, id: string): FamilyData {
  const newData = { ...data, relationships: data.relationships.filter(r => r.id !== id) };
  saveData(newData);
  return newData;
}
