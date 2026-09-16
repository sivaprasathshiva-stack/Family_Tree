import type { Person, Relationship } from './types';

// Distinct, readable hues — cycles if a tree has more blood lines than colors.
const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ec4899',
  '#06b6d4', '#a855f7', '#ef4444', '#84cc16',
  '#0ea5e9', '#f97316', '#14b8a6', '#d946ef',
];

// Traces each person up their father's line (falling back to mother's line)
// to the earliest ancestor with no recorded parents — that ancestor is the
// "branch root" everyone below them visually belongs to. A spouse who married
// in with no recorded parents of their own is their own root until you look
// at their children, who inherit their (blood) father's branch as usual.
export function computeBranchRoots(people: Person[], relationships: Relationship[]): Map<string, string> {
  const fatherOf = new Map<string, string>();
  const motherOf = new Map<string, string>();
  for (const rel of relationships) {
    if (rel.relationshipType === 'father') fatherOf.set(rel.personId, rel.relatedPersonId);
    else if (rel.relationshipType === 'mother') motherOf.set(rel.personId, rel.relatedPersonId);
    else if (rel.relationshipType === 'parent' && !fatherOf.has(rel.personId)) fatherOf.set(rel.personId, rel.relatedPersonId);
  }

  const peopleIds = new Set(people.map(p => p.id));
  const cache = new Map<string, string>();

  function rootOf(id: string, seen: Set<string>): string {
    const cached = cache.get(id);
    if (cached) return cached;
    if (seen.has(id)) return id; // guard against a data-entry cycle
    seen.add(id);
    const parentId = fatherOf.get(id) ?? motherOf.get(id);
    const root = parentId && peopleIds.has(parentId) ? rootOf(parentId, seen) : id;
    cache.set(id, root);
    return root;
  }

  const roots = new Map<string, string>();
  for (const p of people) roots.set(p.id, rootOf(p.id, new Set()));
  return roots;
}

// One color per distinct branch root, plus a lookup from person -> their branch color.
export function assignBranchColors(people: Person[], relationships: Relationship[]): { colorByPerson: Map<string, string>; rootByPerson: Map<string, string> } {
  const rootByPerson = computeBranchRoots(people, relationships);
  const uniqueRoots = [...new Set(rootByPerson.values())].sort();
  const colorByRoot = new Map(uniqueRoots.map((rootId, i) => [rootId, PALETTE[i % PALETTE.length]]));

  const colorByPerson = new Map<string, string>();
  for (const [personId, rootId] of rootByPerson) colorByPerson.set(personId, colorByRoot.get(rootId)!);
  return { colorByPerson, rootByPerson };
}
