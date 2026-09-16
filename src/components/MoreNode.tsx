import { Plus } from 'lucide-react';

interface MoreNodeData {
  count: number;
}

// A small "+N" hint attached to a boundary person whose further relatives are
// beyond the current depth limit — click them (not this chip) to re-center
// and reveal more.
export default function MoreNode({ data }: { data: unknown }) {
  const { count } = data as MoreNodeData;
  return (
    <div className="pointer-events-none flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full border border-dashed border-slate-300 bg-white px-1.5 text-[10px] font-bold text-slate-400 shadow-sm">
      <Plus size={9} />
      {count}
    </div>
  );
}
