export type Gender = 'male' | 'female' | 'other' | 'unknown';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  photo?: string; // base64 or URL
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType =
  | 'father' | 'mother' | 'son' | 'daughter'
  | 'husband' | 'wife' | 'spouse'
  | 'brother' | 'sister'
  | 'grandfather' | 'grandmother' | 'grandson' | 'granddaughter'
  | 'uncle' | 'aunt' | 'nephew' | 'niece' | 'cousin';

export interface Relationship {
  id: string;
  personId: string;
  relatedPersonId: string;
  relationshipType: RelationshipType;
  createdAt: string;
}

export interface FamilyData {
  people: Person[];
  relationships: Relationship[];
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  father: 'Father', mother: 'Mother', son: 'Son', daughter: 'Daughter',
  husband: 'Husband', wife: 'Wife', spouse: 'Spouse',
  brother: 'Brother', sister: 'Sister',
  grandfather: 'Grandfather', grandmother: 'Grandmother',
  grandson: 'Grandson', granddaughter: 'Granddaughter',
  uncle: 'Uncle', aunt: 'Aunt',
  nephew: 'Nephew', niece: 'Niece', cousin: 'Cousin',
};

export const RELATIONSHIP_GROUPS = {
  'Parent / Child': ['father', 'mother', 'son', 'daughter'] as RelationshipType[],
  'Spouse': ['husband', 'wife', 'spouse'] as RelationshipType[],
  'Sibling': ['brother', 'sister'] as RelationshipType[],
  'Extended Family': ['grandfather', 'grandmother', 'grandson', 'granddaughter', 'uncle', 'aunt', 'nephew', 'niece', 'cousin'] as RelationshipType[],
};

// Returns inverse relationship, accounting for gender
export function getInverseRelationship(type: RelationshipType, gender: Gender): RelationshipType | null {
  const map: Partial<Record<RelationshipType, { male: RelationshipType; female: RelationshipType; other: RelationshipType }>> = {
    father: { male: 'son', female: 'daughter', other: 'son' },
    mother: { male: 'son', female: 'daughter', other: 'son' },
    son: { male: 'father', female: 'mother', other: 'parent' as RelationshipType },
    daughter: { male: 'father', female: 'mother', other: 'parent' as RelationshipType },
    husband: { male: 'husband', female: 'wife', other: 'spouse' },
    wife: { male: 'husband', female: 'wife', other: 'spouse' },
    spouse: { male: 'husband', female: 'wife', other: 'spouse' },
    brother: { male: 'brother', female: 'sister', other: 'sibling' as RelationshipType },
    sister: { male: 'brother', female: 'sister', other: 'sibling' as RelationshipType },
    grandfather: { male: 'grandson', female: 'granddaughter', other: 'grandson' },
    grandmother: { male: 'grandson', female: 'granddaughter', other: 'grandson' },
    grandson: { male: 'grandfather', female: 'grandmother', other: 'grandfather' },
    granddaughter: { male: 'grandfather', female: 'grandmother', other: 'grandfather' },
    uncle: { male: 'nephew', female: 'niece', other: 'nephew' },
    aunt: { male: 'nephew', female: 'niece', other: 'nephew' },
    nephew: { male: 'uncle', female: 'aunt', other: 'uncle' },
    niece: { male: 'uncle', female: 'aunt', other: 'uncle' },
    cousin: { male: 'cousin', female: 'cousin', other: 'cousin' },
  };

  const entry = map[type];
  if (!entry) return null;
  const g = gender === 'unknown' ? 'other' : gender;
  return entry[g] ?? null;
}

// Quick-add relationship options shown on person node
export const QUICK_ADD_RELATIONS: { label: string; type: RelationshipType; defaultGender: Gender }[] = [
  { label: 'Father', type: 'father', defaultGender: 'male' },
  { label: 'Mother', type: 'mother', defaultGender: 'female' },
  { label: 'Spouse', type: 'spouse', defaultGender: 'unknown' },
  { label: 'Son', type: 'son', defaultGender: 'male' },
  { label: 'Daughter', type: 'daughter', defaultGender: 'female' },
  { label: 'Brother', type: 'brother', defaultGender: 'male' },
  { label: 'Sister', type: 'sister', defaultGender: 'female' },
];
