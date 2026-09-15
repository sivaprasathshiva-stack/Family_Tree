import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Person } from '../types';
import { User } from 'lucide-react';
import { genderClasses } from '../theme';

interface PersonNodeData {
  person: Person;
  dimmed?: boolean;
}

function PersonNode({ data, selected }: NodeProps) {
  const { person, dimmed } = data as unknown as PersonNodeData;
  const c = genderClasses(person.gender);
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : null;
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : null;

  return (
    <div
      className={[
        'relative flex w-[180px] min-h-[88px] flex-col items-center gap-1.5 rounded-2xl border-2 px-3.5 py-3',
        'cursor-pointer transition-all duration-200 ease-out',
        dimmed ? 'opacity-20 grayscale' : 'opacity-100',
        selected
          ? 'border-indigo-500 shadow-[0_0_0_4px_rgba(79,70,229,0.14),0_8px_20px_rgba(15,23,42,0.14)] -translate-y-0.5'
          : `${c.border} shadow-sm hover:shadow-lg hover:-translate-y-0.5`,
        c.bg,
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0 !h-2 !w-2" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !h-2 !w-2" />
      <Handle type="target" position={Position.Left} className="!opacity-0 !h-2 !w-2" />
      <Handle type="source" position={Position.Right} className="!opacity-0 !h-2 !w-2" />

      <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-white shadow-sm ${c.border}`}>
        {person.photo
          ? <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
          : <User size={20} className={c.text} />
        }
      </div>

      <div className="max-w-full truncate text-[13px] font-semibold leading-tight text-slate-900">
        {person.name}
      </div>

      {(birthYear || deathYear) && (
        <div className="text-[11px] font-medium text-slate-400">
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
