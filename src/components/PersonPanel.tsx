import type { Person, Relationship, RelationshipType } from '../types';
import { RELATIONSHIP_LABELS } from '../types';
import { X, Edit2, Trash2, Plus, Phone, Mail } from 'lucide-react';

interface PersonPanelProps {
  person: Person;
  people: Person[];
  relationships: Relationship[];
  onEdit: () => void;
  onDelete: () => void;
  onAddRelationship: () => void;
  onDeleteRelationship: (id: string) => void;
  onSelectPerson: (id: string) => void;
  onClose: () => void;
}

const genderColors: Record<string, { bg: string; accent: string }> = {
  male: { bg: '#e8f0f7', accent: '#3d7ab5' },
  female: { bg: '#fce8f0', accent: '#b53d7a' },
  other: { bg: '#ede8f7', accent: '#6d3db5' },
  unknown: { bg: '#f0ede8', accent: '#6b5f54' },
};

export default function PersonPanel({
  person, people, relationships, onEdit, onDelete, onAddRelationship, onDeleteRelationship, onSelectPerson, onClose,
}: PersonPanelProps) {
  const colors = genderColors[person.gender] || genderColors.unknown;
  const personRels = relationships.filter(r => r.personId === person.id);
  const getRelatedPerson = (id: string) => people.find(p => p.id === id);

  function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    try { return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return dateStr; }
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
      background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
      zIndex: 500, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e8e4de',
    }}>
      <div style={{ background: colors.bg, padding: '20px 20px 16px', borderBottom: '1px solid #e8e4de' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', color: colors.accent }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
            background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0,
          }}>
            {person.photo
              ? <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{person.name[0].toUpperCase()}</span>
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a1a' }}>{person.name}</div>
            <div style={{ fontSize: '13px', color: colors.accent, fontWeight: 500, marginTop: '2px' }}>
              {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
              {person.dateOfBirth && ` · b. ${new Date(person.dateOfBirth).getFullYear()}`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {(person.dateOfBirth || person.dateOfDeath) && (
          <Section label="Life">
            {person.dateOfBirth && <Detail label="Born" value={formatDate(person.dateOfBirth)!} />}
            {person.dateOfDeath && <Detail label="Passed" value={formatDate(person.dateOfDeath)!} />}
          </Section>
        )}

        {(person.phone || person.email) && (
          <Section label="Contact">
            {person.phone && <Detail label="Phone" value={person.phone} icon={<Phone size={13} />} />}
            {person.email && <Detail label="Email" value={person.email} icon={<Mail size={13} />} />}
          </Section>
        )}

        {person.notes && (
          <Section label="Notes">
            <p style={{ margin: 0, fontSize: '13px', color: '#4a4540', lineHeight: 1.6 }}>{person.notes}</p>
          </Section>
        )}

        <Section label="Relationships">
          {personRels.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#b0a89e', fontStyle: 'italic' }}>No relationships yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {personRels.map(rel => {
                const related = getRelatedPerson(rel.relatedPersonId);
                if (!related) return null;
                return (
                  <div key={rel.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8f7f4', borderRadius: '8px', padding: '8px 10px',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#8c7c6a', fontWeight: 600 }}>
                        {RELATIONSHIP_LABELS[rel.relationshipType as RelationshipType]}
                      </div>
                      <button onClick={() => onSelectPerson(related.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>{related.name}</span>
                      </button>
                    </div>
                    <button onClick={() => onDeleteRelationship(rel.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8bfb0', padding: '4px', borderRadius: '4px' }} title="Remove">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={onAddRelationship} style={{ ...btnBase, background: '#f0f7ff', color: '#2563eb', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
            <Plus size={15} /> Add Relationship
          </button>
        </Section>
      </div>

      <div style={{ padding: '14px 20px', borderTop: '1px solid #e8e4de', display: 'flex', gap: '8px' }}>
        <button onClick={onEdit} style={{ ...btnBase, flex: 1, background: '#f0ede8', color: '#4a4540', justifyContent: 'center' }}>
          <Edit2 size={14} /> Edit
        </button>
        <button onClick={onDelete} style={{ ...btnBase, flex: 1, background: '#fff0f0', color: '#c0392b', justifyContent: 'center' }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#b0a89e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
      {icon && <span style={{ color: '#8c7c6a', marginTop: '1px' }}>{icon}</span>}
      <div>
        <div style={{ fontSize: '11px', color: '#8c7c6a' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}
