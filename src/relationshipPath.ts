import type { Person, Relationship, RelationshipType } from './types';
import { RELATIONSHIP_LABELS } from './types';

export interface PathStep {
  person: Person;
  relationshipType: RelationshipType; // how `person` relates to the PREVIOUS person in the path
}

// Common multi-hop chains re-labeled the way people actually say them, rather
// than reading out the literal hop-by-hop chain ("father's brother's son").
// Matched against the sequence of relationship types walked from the focus
// person outward. Longer/more specific patterns are checked first.
const NAMED_PATTERNS: { pattern: RelationshipType[]; label: (genderOfLast: string) => string }[] = [
  { pattern: ['father', 'father'], label: () => 'Paternal Grandfather' },
  { pattern: ['father', 'mother'], label: () => 'Paternal Grandmother' },
  { pattern: ['mother', 'father'], label: () => 'Maternal Grandfather' },
  { pattern: ['mother', 'mother'], label: () => 'Maternal Grandmother' },
  { pattern: ['son', 'son'], label: () => 'Grandson' },
  { pattern: ['son', 'daughter'], label: () => 'Granddaughter' },
  { pattern: ['daughter', 'son'], label: () => 'Grandson' },
  { pattern: ['daughter', 'daughter'], label: () => 'Granddaughter' },
  { pattern: ['father', 'brother'], label: g => g === 'female' ? 'Paternal Aunt (by marriage)' : 'Paternal Uncle' },
  { pattern: ['father', 'sister'], label: () => 'Paternal Aunt' },
  { pattern: ['mother', 'brother'], label: () => 'Maternal Uncle' },
  { pattern: ['mother', 'sister'], label: g => g === 'male' ? 'Maternal Uncle (by marriage)' : 'Maternal Aunt' },
  { pattern: ['brother', 'son'], label: g => g === 'female' ? 'Niece' : 'Nephew' },
  { pattern: ['brother', 'daughter'], label: () => 'Niece' },
  { pattern: ['sister', 'son'], label: () => 'Nephew' },
  { pattern: ['sister', 'daughter'], label: () => 'Niece' },
  { pattern: ['father', 'brother', 'son'], label: g => g === 'female' ? 'Paternal Cousin (sister)' : 'Paternal Cousin (brother)' },
  { pattern: ['father', 'brother', 'daughter'], label: () => 'Paternal Cousin (sister)' },
  { pattern: ['father', 'sister', 'son'], label: () => 'Paternal Cousin (brother)' },
  { pattern: ['father', 'sister', 'daughter'], label: () => 'Paternal Cousin (sister)' },
  { pattern: ['mother', 'brother', 'son'], label: () => 'Maternal Cousin (brother)' },
  { pattern: ['mother', 'brother', 'daughter'], label: () => 'Maternal Cousin (sister)' },
  { pattern: ['mother', 'sister', 'son'], label: () => 'Maternal Cousin (brother)' },
  { pattern: ['mother', 'sister', 'daughter'], label: () => 'Maternal Cousin (sister)' },
  { pattern: ['spouse', 'father'], label: () => 'Father-in-law' },
  { pattern: ['spouse', 'mother'], label: () => 'Mother-in-law' },
  { pattern: ['spouse', 'brother'], label: () => 'Brother-in-law' },
  { pattern: ['spouse', 'sister'], label: () => 'Sister-in-law' },
];

// Canonicalizes gender-neutral relation types so pattern matching (written in
// gendered terms) still works when a relative's gender is unknown.
function canon(type: RelationshipType): RelationshipType {
  const map: Partial<Record<RelationshipType, RelationshipType>> = {
    parent: 'father', child: 'son', sibling: 'brother',
    grandparent: 'father', grandchild: 'son', auntUncle: 'uncle', nieceNephew: 'nephew',
  };
  return map[type] ?? type;
}

// BFS over the undirected relationship graph (personId <-> relatedPersonId)
// to find the shortest chain connecting two people, since Indian families
// commonly need "how is X related to me" answered for someone 1000s of
// records away rather than found by browsing.
export function findRelationshipPath(
  fromId: string,
  toId: string,
  people: Person[],
  relationships: Relationship[]
): PathStep[] | null {
  if (fromId === toId) return [];
  const peopleById = new Map(people.map(p => [p.id, p]));

  // Adjacency: from -> [{ to, type }] where `type` describes `to` relative to `from`.
  const adjacency = new Map<string, { id: string; type: RelationshipType }[]>();
  for (const rel of relationships) {
    if (!adjacency.has(rel.personId)) adjacency.set(rel.personId, []);
    adjacency.get(rel.personId)!.push({ id: rel.relatedPersonId, type: rel.relationshipType });
  }

  const visited = new Set([fromId]);
  const queue: string[] = [fromId];
  const prev = new Map<string, { id: string; type: RelationshipType }>();

  while (queue.length) {
    const current = queue.shift()!;
    if (current === toId) break;
    for (const { id, type } of adjacency.get(current) ?? []) {
      if (visited.has(id)) continue;
      visited.add(id);
      prev.set(id, { id: current, type });
      queue.push(id);
    }
  }

  if (!visited.has(toId)) return null;

  const steps: PathStep[] = [];
  let cursor = toId;
  while (cursor !== fromId) {
    const step = prev.get(cursor);
    if (!step) return null;
    const person = peopleById.get(cursor);
    if (!person) return null;
    steps.unshift({ person, relationshipType: step.type });
    cursor = step.id;
  }
  return steps;
}

// Turns a hop-by-hop path into a short, human-readable relationship label,
// e.g. "Paternal Uncle" instead of "Father's Brother".
export function describeRelationshipPath(steps: PathStep[]): string {
  if (steps.length === 0) return 'You';
  const canonicalChain = steps.map(s => canon(s.relationshipType));
  const lastGender = steps[steps.length - 1].person.gender;

  for (const { pattern, label } of NAMED_PATTERNS) {
    if (pattern.length !== canonicalChain.length) continue;
    if (pattern.every((t, i) => t === canonicalChain[i])) return label(lastGender);
  }

  if (steps.length === 1) return RELATIONSHIP_LABELS[steps[0].relationshipType];

  // Fall back to the literal chain of relations, e.g. "Father's Brother's Son".
  return steps.map(s => RELATIONSHIP_LABELS[s.relationshipType]).join("'s ");
}
