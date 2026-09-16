import type { Person, Relationship, RelationshipType } from './types';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;
const H_GAP = 60;
const V_GAP = 100;

const SPOUSE_TYPES: RelationshipType[] = ['husband', 'wife', 'spouse'];
const SIBLING_TYPES: RelationshipType[] = ['brother', 'sister', 'sibling'];
// relatedPersonId is personId's parent for these types — the edge runs child -> parent.
const PARENT_REL_TYPES: RelationshipType[] = ['father', 'mother', 'parent'];
// relatedPersonId is personId's child for these types — the edge runs parent -> child.
const CHILD_REL_TYPES: RelationshipType[] = ['son', 'daughter', 'child'];

function getEdgeGroup(type: RelationshipType): string {
  if (SPOUSE_TYPES.includes(type)) return 'spouse';
  if (SIBLING_TYPES.includes(type)) return 'sibling';
  if (PARENT_REL_TYPES.includes(type) || CHILD_REL_TYPES.includes(type)) return 'parent';
  return 'extended';
}

function getParentChildIds(rel: Relationship): { parentId: string; childId: string } | null {
  if (PARENT_REL_TYPES.includes(rel.relationshipType)) return { parentId: rel.relatedPersonId, childId: rel.personId };
  if (CHILD_REL_TYPES.includes(rel.relationshipType)) return { parentId: rel.personId, childId: rel.relatedPersonId };
  return null;
}

// Builds styled, deduped edges for whichever people pass `includeId`. Parent/child
// edges route as a shared "family bus": a trunk drops from the midpoint between a
// couple (or a single parent) to a horizontal line at the child generation, so
// siblings sharing parents read as one connector instead of criss-crossing lines.
// Sibling-to-sibling edges are skipped entirely — that bus already implies it.
function buildFamilyEdges(
  relationships: Relationship[],
  includeId: (id: string) => boolean,
  getPos: (id: string) => { x: number; y: number } | undefined
): Edge[] {
  const spouseOf = new Map<string, string>();
  for (const rel of relationships) {
    if (SPOUSE_TYPES.includes(rel.relationshipType) && includeId(rel.personId) && includeId(rel.relatedPersonId)) {
      spouseOf.set(rel.personId, rel.relatedPersonId);
    }
  }

  function trunkXOf(parentId: string): number {
    const pos = getPos(parentId);
    if (!pos) return 0;
    const spouseId = spouseOf.get(parentId);
    const spousePos = spouseId ? getPos(spouseId) : undefined;
    const cx = pos.x + NODE_WIDTH / 2;
    return spousePos ? (cx + spousePos.x + NODE_WIDTH / 2) / 2 : cx;
  }

  const edgeSet = new Set<string>();
  const edges: Edge[] = [];

  for (const rel of relationships) {
    if (!includeId(rel.personId) || !includeId(rel.relatedPersonId)) continue;
    const group = getEdgeGroup(rel.relationshipType);
    if (group === 'sibling') continue;

    const sortedIds = [rel.personId, rel.relatedPersonId].sort().join('-');
    const key = `${sortedIds}-${group}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);

    if (group === 'parent') {
      const pc = getParentChildIds(rel);
      const parentPos = pc && getPos(pc.parentId);
      const childPos = pc && getPos(pc.childId);
      if (!pc || !parentPos || !childPos) continue;

      const trunkX = trunkXOf(pc.parentId);
      const childCx = childPos.x + NODE_WIDTH / 2;
      const parentBottomY = parentPos.y + NODE_HEIGHT;
      const busY = (parentBottomY + childPos.y) / 2;

      edges.push({
        id: rel.id,
        source: pc.parentId,
        target: pc.childId,
        type: 'familyEdge',
        data: { trunkX, busY, childCx, parentBottomY, childTopY: childPos.y },
        style: { stroke: '#c8bfb0', strokeWidth: 1.5 },
      });
      continue;
    }

    const isSpouse = group === 'spouse';
    edges.push({
      id: rel.id,
      source: rel.personId,
      target: rel.relatedPersonId,
      type: 'straight',
      style: {
        stroke: isSpouse ? '#e8a87c' : '#d4cdbf',
        strokeWidth: isSpouse ? 2 : 1.25,
        strokeDasharray: isSpouse ? '5 3' : '2 3',
      },
    });
  }

  return edges;
}

// ─────────────────────────────────────────────────────────────────────────
// Default (unfocused) layout — a fixed tree built from whoever has no
// parents recorded, unrelated to any selected person.
// ─────────────────────────────────────────────────────────────────────────

interface TreeNode {
  person: Person;
  children: TreeNode[];
  parents: TreeNode[];
  x: number;
  y: number;
  level: number;
}

function buildTreeNodes(people: Person[], relationships: Relationship[]): Map<string, TreeNode> {
  const nodeMap = new Map<string, TreeNode>();
  for (const person of people) {
    nodeMap.set(person.id, { person, children: [], parents: [], x: 0, y: 0, level: 0 });
  }

  for (const rel of relationships) {
    const from = nodeMap.get(rel.personId);
    const to = nodeMap.get(rel.relatedPersonId);
    if (!from || !to) continue;

    if (['father', 'mother', 'grandfather', 'grandmother', 'parent', 'grandparent'].includes(rel.relationshipType)) {
      // relatedPersonId (to) is personId's (from) parent/grandparent — to sits above from.
      if (!to.children.includes(from)) to.children.push(from);
      if (!from.parents.includes(to)) from.parents.push(to);
    } else if (['son', 'daughter', 'grandson', 'granddaughter', 'child', 'grandchild'].includes(rel.relationshipType)) {
      // relatedPersonId (to) is personId's (from) child/grandchild — to sits below from.
      if (!from.children.includes(to)) from.children.push(to);
      if (!to.parents.includes(from)) to.parents.push(from);
    }
  }

  return nodeMap;
}

function assignLevels(nodeMap: Map<string, TreeNode>, relationships: Relationship[]): void {
  const roots = [...nodeMap.values()].filter(n => n.parents.length === 0);
  const visited = new Set<string>();

  function setLevel(node: TreeNode, level: number) {
    if (visited.has(node.person.id) && node.level >= level) return;
    visited.add(node.person.id);
    node.level = Math.max(node.level, level);
    for (const child of node.children) setLevel(child, level + 1);
  }

  for (const root of roots) setLevel(root, 0);
  for (const node of nodeMap.values()) {
    if (!visited.has(node.person.id)) node.level = 0;
  }

  // Someone with no recorded blood parents (e.g. married into the family)
  // defaults to level 0 above — pull them to their spouse's level instead,
  // since marriage carries no generational distance. A few passes handle
  // chained in-law cases (e.g. that spouse's own sibling-in-law).
  const spousePairs = relationships
    .filter(r => SPOUSE_TYPES.includes(r.relationshipType))
    .map(r => [r.personId, r.relatedPersonId] as const);

  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const [aId, bId] of spousePairs) {
      const a = nodeMap.get(aId);
      const b = nodeMap.get(bId);
      if (!a || !b || a.level === b.level) continue;
      if (a.parents.length === 0 && b.parents.length > 0) { a.level = b.level; changed = true; }
      else if (b.parents.length === 0 && a.parents.length > 0) { b.level = a.level; changed = true; }
    }
    if (!changed) break;
  }
}

function assignPositions(nodeMap: Map<string, TreeNode>, relationships: Relationship[]): void {
  const levels = new Map<number, TreeNode[]>();
  for (const node of nodeMap.values()) {
    const lvl = node.level;
    if (!levels.has(lvl)) levels.set(lvl, []);
    levels.get(lvl)!.push(node);
  }

  const spouseOf = new Map<string, string>();
  for (const rel of relationships) {
    if (SPOUSE_TYPES.includes(rel.relationshipType)) {
      spouseOf.set(rel.personId, rel.relatedPersonId);
    }
  }

  const sortedLevels = [...levels.keys()].sort((a, b) => a - b);

  // Pass 1: pack left-to-right per level, keeping spouse pairs adjacent.
  for (const lvl of sortedLevels) {
    const nodes = levels.get(lvl)!;
    const ordered: TreeNode[] = [];
    const placed = new Set<string>();
    for (const node of nodes) {
      if (placed.has(node.person.id)) continue;
      ordered.push(node);
      placed.add(node.person.id);
      const spouseId = spouseOf.get(node.person.id);
      if (spouseId && !placed.has(spouseId)) {
        const spouseNode = nodes.find(n => n.person.id === spouseId);
        if (spouseNode) { ordered.push(spouseNode); placed.add(spouseId); }
      }
    }
    let xOffset = 0;
    for (const node of ordered) {
      node.x = xOffset;
      node.y = lvl * (NODE_HEIGHT + V_GAP);
      xOffset += NODE_WIDTH + H_GAP;
    }
  }

  // Pass 2: bottom-up, center each parent over the mean x of its children,
  // but only when doing so wouldn't overlap its neighbors at the same level.
  for (const lvl of [...sortedLevels].reverse()) {
    const nodes = levels.get(lvl)!.slice().sort((a, b) => a.x - b.x);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.children.length === 0) continue;
      const meanX = node.children.reduce((sum, c) => sum + c.x, 0) / node.children.length;
      const leftBound = i > 0 ? nodes[i - 1].x + NODE_WIDTH + H_GAP : -Infinity;
      const rightBound = i < nodes.length - 1 ? nodes[i + 1].x - NODE_WIDTH - H_GAP : Infinity;
      if (meanX >= leftBound && meanX <= rightBound) node.x = meanX;
    }
  }
}

export function buildFlowGraph(people: Person[], relationships: Relationship[]): { nodes: Node[]; edges: Edge[] } {
  if (people.length === 0) return { nodes: [], edges: [] };

  const nodeMap = buildTreeNodes(people, relationships);
  assignLevels(nodeMap, relationships);
  assignPositions(nodeMap, relationships);

  const nodes: Node[] = [...nodeMap.values()].map(tn => ({
    id: tn.person.id,
    type: 'personNode',
    position: { x: tn.x, y: tn.y },
    data: { person: tn.person },
  }));

  const peopleIds = new Set(people.map(p => p.id));
  const edges = buildFamilyEdges(relationships, id => peopleIds.has(id), id => {
    const tn = nodeMap.get(id);
    return tn ? { x: tn.x, y: tn.y } : undefined;
  });

  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────────────────
// Focused (person-centric) layout — recomputes the whole tree so the
// selected person sits at the visual center, with everyone else placed
// relative to them: ancestors above, descendants below, same-generation
// relatives (spouse, siblings, cousins) alongside.
// ─────────────────────────────────────────────────────────────────────────

// How many generations relatedPersonId sits above (negative) or below
// (positive) personId, for a relationship personId --type--> relatedPersonId.
const LEVEL_DELTA: Record<RelationshipType, number> = {
  father: -1, mother: -1, parent: -1,
  grandfather: -2, grandmother: -2, grandparent: -2,
  son: 1, daughter: 1, child: 1,
  grandson: 2, granddaughter: 2, grandchild: 2,
  husband: 0, wife: 0, spouse: 0,
  brother: 0, sister: 0, sibling: 0,
  cousin: 0,
  uncle: -1, aunt: -1, auntUncle: -1,
  nephew: 1, niece: 1, nieceNephew: 1,
};

function buildLevelAdjacency(relationships: Relationship[]): Map<string, { id: string; delta: number }[]> {
  const adjacency = new Map<string, { id: string; delta: number }[]>();
  for (const rel of relationships) {
    const delta = LEVEL_DELTA[rel.relationshipType];
    if (!adjacency.has(rel.personId)) adjacency.set(rel.personId, []);
    adjacency.get(rel.personId)!.push({ id: rel.relatedPersonId, delta });
  }
  return adjacency;
}

// BFS out from the focus person; only relatives reachable this way appear
// in the focused view — everyone else is left out rather than just dimmed.
function assignFocusLevels(focusId: string, adjacency: Map<string, { id: string; delta: number }[]>): Map<string, number> {
  const levels = new Map<string, number>([[focusId, 0]]);
  const queue: string[] = [focusId];

  while (queue.length) {
    const current = queue.shift()!;
    const currentLevel = levels.get(current)!;
    for (const { id, delta } of adjacency.get(current) ?? []) {
      if (levels.has(id)) continue;
      levels.set(id, currentLevel + delta);
      queue.push(id);
    }
  }

  return levels;
}

// Places each level's nodes left-to-right using a barycenter heuristic:
// a node's x is the average x of its already-placed neighbors one level
// closer to the focus, keeping the tree readable instead of crossing over.
function assignFocusPositions(focusId: string, levels: Map<string, number>, relationships: Relationship[]): Map<string, number> {
  const byLevel = new Map<number, string[]>();
  for (const [id, lvl] of levels) {
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(id);
  }

  const spouseOf = new Map<string, string>();
  const neighborsOf = new Map<string, string[]>();
  for (const rel of relationships) {
    if (!levels.has(rel.personId) || !levels.has(rel.relatedPersonId)) continue;
    if (SPOUSE_TYPES.includes(rel.relationshipType)) spouseOf.set(rel.personId, rel.relatedPersonId);
    if (!neighborsOf.has(rel.personId)) neighborsOf.set(rel.personId, []);
    neighborsOf.get(rel.personId)!.push(rel.relatedPersonId);
  }

  const x = new Map<string, number>();
  // Nearest levels first, since further levels barycenter off of them.
  const levelKeys = [...byLevel.keys()].sort((a, b) => Math.abs(a) - Math.abs(b));

  for (const lvl of levelKeys) {
    const ids = byLevel.get(lvl)!;
    let keyed: { id: string; key: number }[];

    if (lvl === 0) {
      // Focus at the center, spouse(s) right beside it, everyone else
      // (siblings, cousins) fanned out alternately to either side.
      const spouseIds = new Set(ids.filter(id => spouseOf.get(focusId) === id || spouseOf.get(id) === focusId));
      const rest = ids.filter(id => id !== focusId && !spouseIds.has(id));
      keyed = [{ id: focusId, key: 0 }];
      [...spouseIds].forEach((id, i) => keyed.push({ id, key: 0.5 + i * 0.5 }));
      rest.forEach((id, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const magnitude = Math.floor(i / 2) + 2;
        keyed.push({ id, key: side * magnitude });
      });
    } else {
      const refLevel = lvl > 0 ? lvl - 1 : lvl + 1;
      keyed = ids.map(id => {
        const refNeighbors = (neighborsOf.get(id) ?? []).filter(n => levels.get(n) === refLevel);
        const refXs = refNeighbors.map(n => x.get(n)).filter((v): v is number => v !== undefined);
        const key = refXs.length ? refXs.reduce((a, b) => a + b, 0) / refXs.length : 0;
        return { id, key };
      });
    }

    keyed.sort((a, b) => a.key - b.key);

    // Keep spouse pairs adjacent even after the barycenter sort.
    const ordered: string[] = [];
    const placed = new Set<string>();
    for (const { id } of keyed) {
      if (placed.has(id)) continue;
      ordered.push(id);
      placed.add(id);
      const spouseId = spouseOf.get(id);
      if (spouseId && levels.get(spouseId) === lvl && !placed.has(spouseId)) {
        ordered.push(spouseId);
        placed.add(spouseId);
      }
    }

    const tempX = new Map<string, number>();
    ordered.forEach((id, i) => tempX.set(id, i * (NODE_WIDTH + H_GAP)));

    const shift = lvl === 0
      ? -tempX.get(focusId)!
      : keyed.reduce((sum, k) => sum + k.key, 0) / keyed.length
        - ordered.reduce((sum, id) => sum + tempX.get(id)!, 0) / ordered.length;

    for (const id of ordered) x.set(id, tempX.get(id)! + shift);
  }

  return x;
}

export function buildFocusedGraph(focusId: string, people: Person[], relationships: Relationship[]): { nodes: Node[]; edges: Edge[] } {
  const peopleById = new Map(people.map(p => [p.id, p]));
  if (!peopleById.has(focusId)) return { nodes: [], edges: [] };

  const adjacency = buildLevelAdjacency(relationships);
  const levels = assignFocusLevels(focusId, adjacency);
  const xPositions = assignFocusPositions(focusId, levels, relationships);

  const nodes: Node[] = [...levels.entries()]
    .filter(([id]) => peopleById.has(id))
    .map(([id, lvl]) => ({
      id,
      type: 'personNode',
      position: { x: xPositions.get(id) ?? 0, y: lvl * (NODE_HEIGHT + V_GAP) },
      data: { person: peopleById.get(id)! },
    }));

  const includedIds = new Set(nodes.map(n => n.id));
  const nodePos = new Map(nodes.map(n => [n.id, n.position]));
  const edges = buildFamilyEdges(relationships, id => includedIds.has(id), id => nodePos.get(id));

  return { nodes, edges };
}
