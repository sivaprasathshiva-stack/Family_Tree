import { useState } from 'react';
import { Search, TreePine, UserPlus } from 'lucide-react';
import type { Person } from '../types';
import Avatar from './Avatar';

interface ClaimProfileModalProps {
  people: Person[];
  onClaim: (personId: string) => void;
  onCreateNew: () => void;
}

// Shown once per account when a logged-in user isn't yet linked to a node in
// the tree. Without this, the app has no way to know whose family circle to
// show by default — every login would land on the full, unfiltered tree.
export default function ClaimProfileModal({ people, onClaim, onCreateNew }: ClaimProfileModalProps) {
  const [query, setQuery] = useState('');
  const results = query.trim()
    ? people.filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200">
          <TreePine size={26} className="text-white" />
        </div>
        <h2 className="m-0 mb-1.5 text-center text-xl font-bold text-slate-900">Which one is you?</h2>
        <p className="m-0 mb-5 text-center text-[13px] leading-relaxed text-slate-500">
          Link your account to your profile in the tree so we can show your own family circle first.
        </p>

        <div className="relative mb-3">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your name…"
            className="w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-indigo-400 focus:bg-white"
          />
        </div>

        {results.length > 0 && (
          <div className="mb-3 max-h-64 overflow-y-auto rounded-xl border border-slate-100">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => onClaim(p.id)}
                className="flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50"
              >
                <Avatar photo={p.photo} name={p.name} gender={p.gender} size={32} />
                <span className="truncate text-[13px] font-semibold text-slate-900">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="mb-3 rounded-xl bg-slate-50 px-3 py-3 text-center text-[13px] text-slate-400">
            No match found for "{query.trim()}"
          </div>
        )}

        <button
          onClick={onCreateNew}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-slate-200 py-2.5 text-[13px] font-semibold text-slate-500 transition-colors duration-150 hover:border-indigo-300 hover:text-indigo-600"
        >
          <UserPlus size={15} /> I'm not listed yet — add me
        </button>
      </div>
    </div>
  );
}
