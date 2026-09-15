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
  | 'uncle' | 'aunt' | 'nephew' | 'niece' | 'cousin'
  // Gender-neutral forms, used only when auto-generating the inverse of a
  // relationship for a person whose gender is 'other' or 'unknown'.
  | 'parent' | 'child' | 'sibling' | 'grandparent' | 'grandchild' | 'auntUncle' | 'nieceNephew';

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
  parent: 'Parent', child: 'Child', sibling: 'Sibling',
  grandparent: 'Grandparent', grandchild: 'Grandchild',
  auntUncle: 'Aunt/Uncle', nieceNephew: 'Niece/Nephew',
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
    father: { male: 'son', female: 'daughter', other: 'child' },
    mother: { male: 'son', female: 'daughter', other: 'child' },
    son: { male: 'father', female: 'mother', other: 'parent' },
    daughter: { male: 'father', female: 'mother', other: 'parent' },
    husband: { male: 'husband', female: 'wife', other: 'spouse' },
    wife: { male: 'husband', female: 'wife', other: 'spouse' },
    spouse: { male: 'husband', female: 'wife', other: 'spouse' },
    brother: { male: 'brother', female: 'sister', other: 'sibling' },
    sister: { male: 'brother', female: 'sister', other: 'sibling' },
    grandfather: { male: 'grandson', female: 'granddaughter', other: 'grandchild' },
    grandmother: { male: 'grandson', female: 'granddaughter', other: 'grandchild' },
    grandson: { male: 'grandfather', female: 'grandmother', other: 'grandparent' },
    granddaughter: { male: 'grandfather', female: 'grandmother', other: 'grandparent' },
    uncle: { male: 'nephew', female: 'niece', other: 'nieceNephew' },
    aunt: { male: 'nephew', female: 'niece', other: 'nieceNephew' },
    nephew: { male: 'uncle', female: 'aunt', other: 'auntUncle' },
    niece: { male: 'uncle', female: 'aunt', other: 'auntUncle' },
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
