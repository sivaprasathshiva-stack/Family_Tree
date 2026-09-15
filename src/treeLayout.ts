import type { Person, Relationship } from './types';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;
const H_GAP = 60;
const V_GAP = 100;

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
      if (!from.children.includes(to)) from.children.push(to);
      if (!to.parents.includes(from)) to.parents.push(from);
    } else if (['son', 'daughter', 'grandson', 'granddaughter', 'child', 'grandchild'].includes(rel.relationshipType)) {
      if (!to.children.includes(from)) to.children.push(from);
      if (!from.parents.includes(to)) from.parents.push(to);
    }
  }

  return nodeMap;
}

function assignLevels(nodeMap: Map<string, TreeNode>): void {
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
    if (['husband', 'wife', 'spouse'].includes(rel.relationshipType)) {
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
  assignLevels(nodeMap);
  assignPositions(nodeMap, relationships);

  const nodes: Node[] = [...nodeMap.values()].map(tn => ({
    id: tn.person.id,
    type: 'personNode',
    position: { x: tn.x, y: tn.y },
    data: { person: tn.person },
  }));

  const edgeSet = new Set<string>();
  const edges: Edge[] = [];

  for (const rel of relationships) {
    const sortedIds = [rel.personId, rel.relatedPersonId].sort().join('-');
    const group = getEdgeGroup(rel.relationshipType);
    const key = `${sortedIds}-${group}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);

    const isSpouse = ['husband', 'wife', 'spouse'].includes(rel.relationshipType);
    const isSibling = ['brother', 'sister', 'sibling'].includes(rel.relationshipType);

    edges.push({
      id: rel.id,
      source: rel.personId,
      target: rel.relatedPersonId,
      type: 'smoothstep',
      style: {
        stroke: isSpouse ? '#e8a87c' : isSibling ? '#94b4c1' : '#c8bfb0',
        strokeWidth: isSpouse ? 2 : 1.5,
        strokeDasharray: isSpouse ? '5 3' : undefined,
      },
    });
  }

  return { nodes, edges };
}

function getEdgeGroup(type: string): string {
  if (['husband', 'wife', 'spouse'].includes(type)) return 'spouse';
  if (['brother', 'sister', 'sibling'].includes(type)) return 'sibling';
  if (['father', 'mother', 'son', 'daughter', 'parent', 'child'].includes(type)) return 'parent';
  return 'extended';
}
