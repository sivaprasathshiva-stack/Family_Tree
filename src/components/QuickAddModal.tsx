import { useState } from 'react';
import type { Person, RelationshipType, Gender } from '../types';
import { QUICK_ADD_RELATIONS, RELATIONSHIP_LABELS } from '../types';
import { X, Plus, Search } from 'lucide-react';

interface QuickAddModalProps {
  currentPerson: Person;
  people: Person[];
  onCreateAndRelate: (name: string, gender: Gender, relType: RelationshipType) => void;
  onRelateExisting: (existingId: string, relType: RelationshipType) => void;
  onCancel: () => void;
}

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e8e4de', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#1a1a1a',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
            {step === 'pick-relation' ? `Add relation to ${currentPerson.name}` : `Add ${RELATIONSHIP_LABELS[relType]}`}
          </h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c7c6a' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {step === 'pick-relation' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {QUICK_ADD_RELATIONS.map(rel => (
                <button key={rel.type} onClick={() => pickRelation(rel.type, rel.defaultGender)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  border: '1.5px solid #e8e4de', borderRadius: '10px', background: '#fff',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}>
                  <Plus size={16} color="#2563eb" />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>Add {rel.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button onClick={() => setStep('pick-relation')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c7c6a', fontSize: '13px', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>← Back</button>

              <div style={{ display: 'flex', border: '1.5px solid #e8e4de', borderRadius: '10px', overflow: 'hidden' }}>
                {(['new', 'existing'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    flex: 1, padding: '8px', border: 'none', background: mode === m ? '#eff6ff' : '#fff',
                    color: mode === m ? '#2563eb' : '#6b5f54', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {m === 'new' ? 'Create New' : 'Existing Person'}
                  </button>
                ))}
              </div>

              {mode === 'new' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b5f54', marginBottom: '6px' }}>Full Name</label>
                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter name" style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b5f54', marginBottom: '6px' }}>Gender</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['male', 'female', 'other', 'unknown'] as Gender[]).map(g => (
                        <button key={g} onClick={() => setNewGender(g)} style={{
                          flex: 1, padding: '6px 4px', border: `1.5px solid ${newGender === g ? '#2563eb' : '#e8e4de'}`,
                          borderRadius: '8px', background: newGender === g ? '#eff6ff' : '#fff',
                          color: newGender === g ? '#2563eb' : '#8c7c6a', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleCreate} disabled={!newName.trim()} style={{
                    width: '100%', padding: '10px', border: 'none', borderRadius: '10px',
                    background: newName.trim() ? '#2563eb' : '#c8bfb0', color: '#fff',
                    fontSize: '14px', fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}>Create & Link</button>
                </>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0a89e' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: '34px' }} />
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid #e8e4de', borderRadius: '10px', overflow: 'hidden' }}>
                    {filtered.length === 0
                      ? <div style={{ padding: '16px', textAlign: 'center', color: '#b0a89e', fontSize: '13px' }}>No people found</div>
                      : filtered.map(p => (
                        <button key={p.id} onClick={() => onRelateExisting(p.id, relType)} style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          padding: '10px 14px', border: 'none', borderBottom: '1px solid #f0ede8',
                          background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8e4de', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, color: '#8c7c6a', fontSize: '12px' }}>{p.name[0]}</span>}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a' }}>{p.name}</span>
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
