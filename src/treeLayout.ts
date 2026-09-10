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

    if (['father', 'mother', 'grandfather', 'grandmother'].includes(rel.relationshipType)) {
      if (!from.children.includes(to)) from.children.push(to);
      if (!to.parents.includes(from)) to.parents.push(from);
    } else if (['son', 'daughter', 'grandson', 'granddaughter'].includes(rel.relationshipType)) {
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

function assignPositions(nodeMap: Map<string, TreeNode>): void {
  const levels = new Map<number, TreeNode[]>();
  for (const node of nodeMap.values()) {
    const lvl = node.level;
    if (!levels.has(lvl)) levels.set(lvl, []);
    levels.get(lvl)!.push(node);
  }

  const sortedLevels = [...levels.keys()].sort((a, b) => a - b);
  for (const lvl of sortedLevels) {
    const nodes = levels.get(lvl)!;
    let xOffset = 0;
    for (const node of nodes) {
      node.x = xOffset;
      node.y = lvl * (NODE_HEIGHT + V_GAP);
      xOffset += NODE_WIDTH + H_GAP;
    }
  }
}

export function buildFlowGraph(people: Person[], relationships: Relationship[]): { nodes: Node[]; edges: Edge[] } {
  if (people.length === 0) return { nodes: [], edges: [] };

  const nodeMap = buildTreeNodes(people, relationships);
  assignLevels(nodeMap);
  assignPositions(nodeMap);

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
    const isSibling = ['brother', 'sister'].includes(rel.relationshipType);

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
  if (['brother', 'sister'].includes(type)) return 'sibling';
  if (['father', 'mother', 'son', 'daughter'].includes(type)) return 'parent';
  return 'extended';
}
