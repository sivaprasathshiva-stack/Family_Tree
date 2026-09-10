import { useState } from 'react';
import type { Person, RelationshipType } from '../types';
import { RELATIONSHIP_LABELS, RELATIONSHIP_GROUPS } from '../types';
import { X, Search } from 'lucide-react';

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1.5px solid #e8e4de', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#1a1a1a',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Relationship</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c7c6a' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#f8f7f4', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ fontSize: '11px', color: '#8c7c6a', fontWeight: 600 }}>Setting relationship for</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{currentPerson.name}</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b5f54', marginBottom: '8px' }}>Relationship Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(RELATIONSHIP_GROUPS).map(([groupName, types]) => (
                <div key={groupName}>
                  <div style={{ fontSize: '11px', color: '#b0a89e', fontWeight: 600, marginBottom: '4px' }}>{groupName}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {types.map(type => (
                      <button key={type} onClick={() => setRelType(type)} style={{
                        padding: '5px 10px', border: `1.5px solid ${relType === type ? '#2563eb' : '#e8e4de'}`,
                        borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                        background: relType === type ? '#eff6ff' : '#fff', color: relType === type ? '#2563eb' : '#6b5f54',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {RELATIONSHIP_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b5f54', marginBottom: '8px' }}>Select Person</label>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0a89e' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." style={{ ...inputStyle, paddingLeft: '34px' }} />
            </div>
            <div style={{ maxHeight: 160, overflowY: 'auto', border: '1.5px solid #e8e4de', borderRadius: '10px', overflow: 'hidden' }}>
              {filtered.length === 0
                ? <div style={{ padding: '14px', textAlign: 'center', color: '#b0a89e', fontSize: '13px' }}>No people found</div>
                : filtered.map(p => (
                  <button key={p.id} onClick={() => setSelectedPerson(p)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 14px', border: 'none', borderBottom: '1px solid #f0ede8',
                    background: selectedPerson?.id === p.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8e4de', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {p.photo ? <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, color: '#8c7c6a', fontSize: '12px' }}>{p.name[0]}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c7c6a' }}>{p.gender}</div>
                    </div>
                    {selectedPerson?.id === p.id && <span style={{ marginLeft: 'auto', color: '#2563eb', fontWeight: 700 }}>✓</span>}
                  </button>
                ))
              }
            </div>
          </div>

          {selectedPerson && (
            <div style={{ background: '#f0f7ff', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#2563eb' }}>
              <strong>{currentPerson.name}</strong> → <strong>{RELATIONSHIP_LABELS[relType]}</strong> → <strong>{selectedPerson.name}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '10px', border: '1.5px solid #e8e4de', borderRadius: '10px', background: '#fff', color: '#6b5f54', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleSave} disabled={!selectedPerson} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '10px', background: selectedPerson ? '#2563eb' : '#c8bfb0', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: selectedPerson ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              Create Relationship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
