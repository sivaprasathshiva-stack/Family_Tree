import { useState } from 'react';
import type { Person, RelationshipType } from '../types';
import { RELATIONSHIP_LABELS, RELATIONSHIP_GROUPS } from '../types';
import { X, Search, Check } from 'lucide-react';

interface RelationshipFormProps {
  currentPerson: Person;
  people: Person[];
  onSave: (relatedPersonId: string, type: RelationshipType) => void;
  onCancel: () => void;
}

export default function RelationshipForm({ currentPerson, people, onSave, onCancel }: RelationshipFormProps) {
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [relType, setRelType] = useState<RelationshipType>('father');

  const otherPeople = people.filter(p => p.id !== currentPerson.id);
  const filtered = otherPeople.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function handleSave() {
    if (!selectedPerson) return;
    onSave(selectedPerson.id, relType);
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:p-4" onClick={onCancel}>
      <div
        className="animate-scale-in scrollbar-thin flex h-full w-full flex-col overflow-y-auto bg-white sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-[440px] sm:rounded-3xl sm:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-6 pb-0 pt-6 backdrop-blur">
          <h2 className="m-0 text-lg font-bold text-slate-900">Add Relationship</h2>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-6 pb-6 pt-5">
          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-slate-400">Setting relationship for</div>
            <div className="text-[15px] font-bold text-slate-900">{currentPerson.name}</div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">Relationship Type</label>
            <div className="flex flex-col gap-3">
              {Object.entries(RELATIONSHIP_GROUPS).map(([groupName, types]) => (
                <div key={groupName}>
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-400">{groupName}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {types.map(type => (
                      <button
                        key={type}
                        onClick={() => setRelType(type)}
                        className={`rounded-full border-[1.5px] px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
                          relType === type ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {RELATIONSHIP_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">Select Person</label>
            <div className="relative mb-2">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full rounded-xl border-[1.5px] border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="scrollbar-thin max-h-40 overflow-y-auto rounded-xl border-[1.5px] border-slate-200">
              {filtered.length === 0
                ? <div className="p-4 text-center text-[13px] text-slate-400">No people found</div>
                : filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerson(p)}
                    className={`flex w-full items-center gap-2.5 border-b border-slate-100 px-3.5 py-2.5 text-left transition-colors duration-150 last:border-b-0 ${
                      selectedPerson?.id === p.id ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                      {p.photo ? <img src={p.photo} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-slate-500">{p.name[0]}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] capitalize text-slate-400">{p.gender}</div>
                    </div>
                    {selectedPerson?.id === p.id && <Check size={16} className="shrink-0 text-indigo-600" />}
                  </button>
                ))
              }
            </div>
          </div>

          {selectedPerson && (
            <div className="animate-fade-in rounded-xl bg-indigo-50 px-3.5 py-3 text-[13px] text-indigo-700">
              <strong>{currentPerson.name}</strong> → <strong>{RELATIONSHIP_LABELS[relType]}</strong> → <strong>{selectedPerson.name}</strong>
            </div>
          )}

          <div className="flex gap-2.5 pb-1">
            <button onClick={onCancel} className="flex-1 rounded-xl border-[1.5px] border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-95">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPerson}
              className={`flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 ${
                selectedPerson ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-95' : 'cursor-not-allowed bg-slate-300'
              }`}
            >
              Create Relationship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
