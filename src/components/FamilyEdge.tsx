import { BaseEdge, type EdgeProps } from '@xyflow/react';

interface FamilyEdgeData {
  trunkX: number;
  busY: number;
  childCx: number;
  parentBottomY: number;
  childTopY: number;
  [key: string]: unknown;
}

// Orthogonal "family bus" connector: drops from the trunk (a couple's midpoint,
// or a single parent) to a shared horizontal line at the child generation, then
// into the child. Multiple children of the same parents share the same trunkX/busY,
// so their edges overlay into what reads as one bus line instead of separate,
// individually-routed lines crossing each other.
export default function FamilyEdge({ data, style, markerEnd }: EdgeProps) {
  const d = data as FamilyEdgeData | undefined;
  if (!d) return null;
  const { trunkX, busY, childCx, parentBottomY, childTopY } = d;

  const path = `M ${trunkX} ${parentBottomY} L ${trunkX} ${busY} L ${childCx} ${busY} L ${childCx} ${childTopY}`;
  return <BaseEdge path={path} style={style} markerEnd={markerEnd} />;
}
