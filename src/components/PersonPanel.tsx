import type { ReactNode } from 'react';
import type { Person, Relationship } from '../types';
import { getImmediateFamily, type FamilyEntry } from '../relationsFocus';
import { genderClasses } from '../theme';
import { X, Edit2, Trash2, Plus, Phone, Mail } from 'lucide-react';
import Avatar from './Avatar';

interface PersonPanelProps {
  person: Person;
  people: Person[];
  relationships: Relationship[];
  onEdit: () => void;
  onDelete: () => void;
  onAddRelationship: () => void;
  onQuickAdd: () => void;
  onDeleteRelationship: (id: string) => void;
  onSelectPerson: (id: string) => void;
  onClose: () => void;
}

export default function PersonPanel({
  person, people, relationships, onEdit, onDelete, onAddRelationship, onQuickAdd, onDeleteRelationship, onSelectPerson, onClose,
}: PersonPanelProps) {
  const c = genderClasses(person.gender);
  const family = getImmediateFamily(person.id, relationships, people);
  const hasAnyFamily = family.parents.length || family.spouses.length || family.children.length || family.siblings.length || family.extended.length;

  function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    try { return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return dateStr; }
  }

  return (
    <div className="animate-slide-up sm:animate-slide-in-right fixed inset-x-0 bottom-0 z-[500] flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:max-h-none sm:w-[380px] sm:rounded-none sm:border-l sm:border-slate-200">
      <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />

      <div className={`shrink-0 px-6 pb-5 pt-4 sm:pt-6 ${c.bg}`}>
        <div className="mb-3 flex justify-end gap-1.5">
          <button onClick={onEdit} title="Edit" className="rounded-lg bg-white/70 p-1.5 text-slate-600 transition-all duration-150 hover:scale-105 hover:bg-white active:scale-95">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} title="Delete" className="rounded-lg bg-white/70 p-1.5 text-rose-600 transition-all duration-150 hover:scale-105 hover:bg-white active:scale-95">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} title="Close" className="rounded-lg bg-white/70 p-1.5 text-slate-600 transition-all duration-150 hover:scale-105 hover:bg-white active:scale-95">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3.5">
          <Avatar photo={person.photo} name={person.name} gender={person.gender} size={56} className="border-2 border-white shadow" />
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-slate-900">{person.name}</div>
            <div className={`mt-0.5 text-[13px] font-medium ${c.text}`}>
              {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
              {person.dateOfBirth && ` · b. ${new Date(person.dateOfBirth).getFullYear()}`}
            </div>
          </div>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
        {(person.dateOfBirth || person.dateOfDeath) && (
          <Section label="Life">
            <div className="space-y-2">
              {person.dateOfBirth && <Detail label="Born" value={formatDate(person.dateOfBirth)!} />}
              {person.dateOfDeath && <Detail label="Passed" value={formatDate(person.dateOfDeath)!} />}
            </div>
          </Section>
        )}

        {(person.phone || person.email) && (
          <Section label="Contact">
            <div className="space-y-2">
              {person.phone && <Detail label="Phone" value={person.phone} icon={<Phone size={13} />} />}
              {person.email && <Detail label="Email" value={person.email} icon={<Mail size={13} />} />}
            </div>
          </Section>
        )}

        {person.notes && (
          <Section label="Notes">
            <p className="m-0 text-[13px] leading-relaxed text-slate-600">{person.notes}</p>
          </Section>
        )}

        <Section label="Family">
          {!hasAnyFamily ? (
            <div className="text-[13px] italic text-slate-400">No relationships yet</div>
          ) : (
            <div className="space-y-4">
              <FamilyGroup title="Parents" entries={family.parents} onSelect={onSelectPerson} onDelete={onDeleteRelationship} />
              <FamilyGroup title="Spouse" entries={family.spouses} onSelect={onSelectPerson} onDelete={onDeleteRelationship} />
              <FamilyGroup title="Children" entries={family.children} onSelect={onSelectPerson} onDelete={onDeleteRelationship} />
              <FamilyGroup title="Siblings" entries={family.siblings} onSelect={onSelectPerson} onDelete={onDeleteRelationship} />
              <FamilyGroup title="Extended Family" entries={family.extended} onSelect={onSelectPerson} onDelete={onDeleteRelationship} />
            </div>
          )}
          <button
            onClick={onQuickAdd}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={15} /> Quick Add
          </button>
          <button
            onClick={onAddRelationship}
            className="mt-2 w-full rounded-xl py-2 text-center text-[12px] font-medium text-slate-400 transition-colors duration-150 hover:text-indigo-600"
          >
            Add a specific relationship type
          </button>
        </Section>
      </div>
    </div>
  );
}

function FamilyGroup({ title, entries, onSelect, onDelete }: {
  title: string; entries: FamilyEntry[]; onSelect: (id: string) => void; onDelete: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="flex flex-col gap-1.5">
        {entries.map(entry => (
          <div key={entry.relationshipId} className="flex items-center gap-2.5 rounded-xl bg-slate-50 py-2 pl-2 pr-2.5 transition-colors duration-150 hover:bg-slate-100">
            <Avatar photo={entry.person.photo} name={entry.person.name} gender={entry.person.gender} size={32} />
            <button onClick={() => onSelect(entry.person.id)} className="min-w-0 flex-1 text-left">
              <div className="truncate text-[13px] font-semibold text-indigo-600 hover:underline">{entry.person.name}</div>
              <div className="text-[11px] text-slate-400">{entry.label}</div>
            </button>
            <button
              onClick={() => onDelete(entry.relationshipId)}
              title="Remove relationship"
              className="shrink-0 rounded-md p-1 text-slate-300 transition-colors duration-150 hover:bg-white hover:text-rose-500"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      {children}
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-slate-400">{icon}</span>}
      <div>
        <div className="text-[11px] text-slate-400">{label}</div>
        <div className="text-[13px] font-medium text-slate-900">{value}</div>
      </div>
    </div>
  );
}
