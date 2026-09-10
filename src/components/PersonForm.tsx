import { useState, useRef, useEffect } from 'react';
import { Person, Gender } from '../types';
import { X, Camera, User } from 'lucide-react';

interface PersonFormProps {
  person?: Person;
  defaultName?: string;
  defaultGender?: Gender;
  onSave: (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  title?: string;
}

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1.5px solid #e8e4de', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#fff', color: '#1a1a1a',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b5f54',
    marginBottom: '4px', letterSpacing: '0.02em',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#8c7c6a' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo upload */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: photo ? 'transparent' : '#f0ede8',
                border: '2px dashed #c8bfb0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                position: 'relative',
              }}
            >
              {photo ? (
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Camera size={20} color="#c8bfb0" />
                  <div style={{ fontSize: '10px', color: '#c8bfb0', marginTop: '2px' }}>Photo</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Enter full name"
              style={{ ...inputStyle, borderColor: error ? '#e05' : '#e8e4de' }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {error && <div style={{ fontSize: '12px', color: '#e05', marginTop: '4px' }}>{error}</div>}
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['male', 'female', 'other', 'unknown'] as Gender[]).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1, padding: '7px 4px', border: `1.5px solid ${gender === g ? '#2563eb' : '#e8e4de'}`,
                    borderRadius: '8px', background: gender === g ? '#eff6ff' : '#fff',
                    color: gender === g ? '#2563eb' : '#8c7c6a', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.1s',
                  }}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date of Death</label>
              <input type="date" value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" style={inputStyle} />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '10px', border: '1.5px solid #e8e4de', borderRadius: '10px',
                background: '#fff', color: '#6b5f54', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 2, padding: '10px', border: 'none', borderRadius: '10px',
                background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
