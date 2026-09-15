import { useState, useRef, useEffect } from 'react';
import type { Person, Gender } from '../types';
import { genderClasses } from '../theme';
import { X, Camera } from 'lucide-react';

interface PersonFormProps {
  person?: Person;
  defaultName?: string;
  defaultGender?: Gender;
  onSave: (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  title?: string;
}

const GENDERS: Gender[] = ['male', 'female', 'other', 'unknown'];

const inputClass = 'w-full rounded-xl border-[1.5px] border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';
const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-slate-500';

export default function PersonForm({ person, defaultName = '', defaultGender = 'unknown', onSave, onCancel, title = 'Add Person' }: PersonFormProps) {
  const [name, setName] = useState(person?.name ?? defaultName);
  const [gender, setGender] = useState<Gender>(person?.gender ?? defaultGender);
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth ?? '');
  const [dateOfDeath, setDateOfDeath] = useState(person?.dateOfDeath ?? '');
  const [photo, setPhoto] = useState(person?.photo ?? '');
  const [phone, setPhone] = useState(person?.phone ?? '');
  const [email, setEmail] = useState(person?.email ?? '');
  const [notes, setNotes] = useState(person?.notes ?? '');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!name.trim()) { setError('Name is required.'); return; }
    onSave({ name: name.trim(), gender, dateOfBirth: dateOfBirth || undefined, dateOfDeath: dateOfDeath || undefined, photo: photo || undefined, phone: phone || undefined, email: email || undefined, notes: notes || undefined });
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:p-4" onClick={onCancel}>
      <div
        className="animate-scale-in scrollbar-thin flex h-full w-full flex-col overflow-y-auto bg-white sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-[440px] sm:rounded-3xl sm:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-6 pb-0 pt-6 backdrop-blur">
          <h2 className="m-0 text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-6 pb-6 pt-5">
          <div className="flex justify-center">
            <div
              onClick={() => fileRef.current?.click()}
              className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-all duration-150 hover:border-indigo-400 hover:scale-105 active:scale-95"
            >
              {photo ? (
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera size={20} className="mx-auto text-slate-400 group-hover:text-indigo-500" />
                  <div className="mt-0.5 text-[10px] text-slate-400">Photo</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Enter full name"
              className={`${inputClass} ${error ? '!border-rose-400 !ring-rose-500/10' : ''}`}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {error && <div className="mt-1.5 text-xs font-medium text-rose-500">{error}</div>}
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <div className="flex gap-2">
              {GENDERS.map(g => {
                const c = genderClasses(g);
                const active = gender === g;
                return (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 rounded-xl border-[1.5px] py-2 text-xs font-semibold capitalize transition-all duration-150 active:scale-95 ${
                      active ? `${c.border} ${c.bg} ${c.text}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Death</label>
              <input type="date" value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={3}
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>

          <div className="mt-1 flex gap-2.5 pb-1">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border-[1.5px] border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-95"
            >
              {person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
