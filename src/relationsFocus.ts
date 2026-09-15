import type { Node, Edge } from '@xyflow/react';
import type { Person, Relationship, RelationshipType } from './types';
import { RELATIONSHIP_LABELS } from './types';

export interface FamilyEntry {
  person: Person;
  label: string;
  relationshipId: string;
}

export interface ImmediateFamily {
  parents: FamilyEntry[];
  spouses: FamilyEntry[];
  children: FamilyEntry[];
  siblings: FamilyEntry[];
  extended: FamilyEntry[];
  allIds: Set<string>;
}

const PARENT_TYPES: RelationshipType[] = ['father', 'mother', 'parent'];
const CHILD_TYPES: RelationshipType[] = ['son', 'daughter', 'child'];
const SPOUSE_TYPES: RelationshipType[] = ['husband', 'wife', 'spouse'];
const SIBLING_TYPES: RelationshipType[] = ['brother', 'sister', 'sibling'];

export function getImmediateFamily(personId: string, relationships: Relationship[], people: Person[]): ImmediateFamily {
  const peopleById = new Map(people.map(p => [p.id, p]));
  const result: ImmediateFamily = { parents: [], spouses: [], children: [], siblings: [], extended: [], allIds: new Set() };

  for (const rel of relationships) {
    if (rel.personId !== personId) continue;
    const related = peopleById.get(rel.relatedPersonId);
    if (!related) continue;

    result.allIds.add(related.id);
    const entry: FamilyEntry = { person: related, label: RELATIONSHIP_LABELS[rel.relationshipType], relationshipId: rel.id };

    if (PARENT_TYPES.includes(rel.relationshipType)) result.parents.push(entry);
    else if (CHILD_TYPES.includes(rel.relationshipType)) result.children.push(entry);
    else if (SPOUSE_TYPES.includes(rel.relationshipType)) result.spouses.push(entry);
    else if (SIBLING_TYPES.includes(rel.relationshipType)) result.siblings.push(entry);
    else result.extended.push(entry);
  }

  return result;
}

// Dims every node except the selected person and their immediate family.
export function applyNodeFocus(nodes: Node[], focusIds: Set<string> | null, selectedId: string | null): Node[] {
  if (!focusIds) return nodes.map(n => (n.data.dimmed ? { ...n, data: { ...n.data, dimmed: false } } : n));
  return nodes.map(n => ({ ...n, data: { ...n.data, dimmed: n.id !== selectedId && !focusIds.has(n.id) } }));
}

// Fades edges not directly touching the selected person.
export function applyEdgeFocus(edges: Edge[], focusIds: Set<string> | null, selectedId: string | null): Edge[] {
  if (!focusIds) return edges.map(e => (e.style?.opacity !== 1 ? { ...e, style: { ...e.style, opacity: 1 } } : e));
  return edges.map(e => ({
    ...e,
    style: { ...e.style, opacity: e.source === selectedId || e.target === selectedId ? 1 : 0.12 },
  }));
}
