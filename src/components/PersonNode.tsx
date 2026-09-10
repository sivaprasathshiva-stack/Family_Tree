import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Person } from '../types';
import { User } from 'lucide-react';

interface PersonNodeData {
  person: Person;
  isSelected?: boolean;
  onClick?: (person: Person) => void;
}

const genderColors = {
  male: { bg: '#e8f0f7', border: '#7baed4', icon: '#3d7ab5' },
  female: { bg: '#fce8f0', border: '#d47baa', icon: '#b53d7a' },
  other: { bg: '#ede8f7', border: '#9a7bd4', icon: '#6d3db5' },
  unknown: { bg: '#f0ede8', border: '#c8bfb0', icon: '#8c7c6a' },
};

function PersonNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as PersonNodeData;
  const { person } = nodeData;
  const colors = genderColors[person.gender] || genderColors.unknown;
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : null;
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : null;

  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${selected ? '#2563eb' : colors.border}`,
        borderRadius: '12px',
        padding: '10px 14px',
        width: 180,
        minHeight: 80,
        cursor: 'pointer',
        boxShadow: selected
          ? '0 0 0 3px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 8, height: 8 }} />

      {/* Avatar */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: person.photo ? 'transparent' : colors.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: `2px solid ${colors.border}`,
      }}>
        {person.photo ? (
          <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User size={22} color="#fff" />
        )}
      </div>

      {/* Name */}
      <div style={{
        fontWeight: 600,
        fontSize: '13px',
        textAlign: 'center',
        color: '#1a1a1a',
        lineHeight: 1.2,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {person.name}
      </div>

      {/* Years */}
      {(birthYear || deathYear) && (
        <div style={{ fontSize: '11px', color: '#8c7c6a', fontWeight: 400 }}>
          {birthYear && deathYear
            ? `${birthYear} – ${deathYear}`
            : birthYear
            ? `b. ${birthYear}`
            : `d. ${deathYear}`}
        </div>
      )}
    </div>
  );
}

export default memo(PersonNode);
