import { useState } from 'react';
import type { Person, RelationshipType, Gender } from '../types';
import { QUICK_ADD_RELATIONS, RELATIONSHIP_LABELS } from '../types';
import { genderClasses } from '../theme';
import { X, Plus, Search, ArrowLeft } from 'lucide-react';

interface QuickAddModalProps {
  currentPerson: Person;
  people: Person[];
  onCreateAndRelate: (name: string, gender: Gender, relType: RelationshipType) => void;
  onRelateExisting: (existingId: string, relType: RelationshipType) => void;
  onCancel: () => void;
}

const GENDERS: Gender[] = ['male', 'female', 'other', 'unknown'];
const inputClass = 'w-full rounded-xl border-[1.5px] border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

export default function QuickAddModal({ currentPerson, people, onCreateAndRelate, onRelateExisting, onCancel }: QuickAddModalProps) {
  const [step, setStep] = useState<'pick-relation' | 'pick-person'>('pick-relation');
  const [relType, setRelType] = useState<RelationshipType>('father');
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<Gender>('unknown');
  const [search, setSearch] = useState('');

  const others = people.filter(p => p.id !== currentPerson.id);
  const filtered = others.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function pickRelation(type: RelationshipType, gender: Gender) {
    setRelType(type);
    setNewGender(gender);
    setStep('pick-person');
  }

  function handleCreate() {
    if (!newName.trim()) return;
    onCreateAndRelate(newName.trim(), newGender, relType);
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:p-4" onClick={onCancel}>
      <div
        className="animate-scale-in scrollbar-thin flex h-full w-full flex-col overflow-y-auto bg-white sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-[400px] sm:rounded-3xl sm:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-6 pb-0 pt-6 backdrop-blur">
          <h2 className="m-0 text-base font-bold text-slate-900">
            {step === 'pick-relation' ? `Add relation to ${currentPerson.name}` : `Add ${RELATIONSHIP_LABELS[relType]}`}
          </h2>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-6 pb-6 pt-4">
          {step === 'pick-relation' ? (
            <div className="flex flex-col gap-2">
              {QUICK_ADD_RELATIONS.map(rel => (
                <button
                  key={rel.type}
                  onClick={() => pickRelation(rel.type, rel.defaultGender)}
                  className="flex items-center gap-3 rounded-xl border-[1.5px] border-slate-200 bg-white px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-[0.98]"
                >
                  <Plus size={16} className="text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">Add {rel.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <button onClick={() => setStep('pick-relation')} className="flex items-center gap-1 self-start text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-600">
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex rounded-xl border-[1.5px] border-slate-200 p-0.5">
                {(['new', 'existing'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition-all duration-150 ${
                      mode === m ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'new' ? 'Create New' : 'Existing Person'}
                  </button>
                ))}
              </div>

              {mode === 'new' ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name</label>
                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter name" className={inputClass} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Gender</label>
                    <div className="flex gap-1.5">
                      {GENDERS.map(g => {
                        const c = genderClasses(g);
                        const active = newGender === g;
                        return (
                          <button
                            key={g}
                            onClick={() => setNewGender(g)}
                            className={`flex-1 rounded-lg border-[1.5px] py-1.5 text-[11px] font-semibold capitalize transition-all duration-150 active:scale-95 ${
                              active ? `${c.border} ${c.bg} ${c.text}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 ${
                      newName.trim() ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-95' : 'cursor-not-allowed bg-slate-300'
                    }`}
                  >
                    Create & Link
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className={`${inputClass} pl-9`} />
                  </div>
                  <div className="scrollbar-thin max-h-52 overflow-y-auto rounded-xl border-[1.5px] border-slate-200">
                    {filtered.length === 0
                      ? <div className="p-4 text-center text-[13px] text-slate-400">No people found</div>
                      : filtered.map(p => (
                        <button
                          key={p.id}
                          onClick={() => onRelateExisting(p.id, relType)}
                          className="flex w-full items-center gap-2.5 border-b border-slate-100 bg-white px-3.5 py-2.5 text-left transition-colors duration-150 last:border-b-0 hover:bg-slate-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                            {p.photo ? <img src={p.photo} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-slate-500">{p.name[0]}</span>}
                          </div>
                          <span className="truncate text-[13px] font-semibold text-slate-900">{p.name}</span>
                        </button>
                      ))
                    }
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
