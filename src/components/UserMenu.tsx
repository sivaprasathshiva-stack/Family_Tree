import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import type { AuthUser } from '../auth';

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', border: 'none',
          background: 'none', cursor: 'pointer', borderRadius: '999px',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {user.picture
            ? <img src={user.picture} alt={user.name || user.email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{(user.name || user.email)[0].toUpperCase()}</span>
          }
        </div>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '40px', right: 0, background: '#fff', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.14)', border: '1px solid #e8e4de', minWidth: '200px', zIndex: 1100,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e8e4de' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{user.name || 'Signed in'}</div>
            <div style={{ fontSize: '12px', color: '#8c7c6a', marginTop: '2px' }}>{user.email}</div>
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px',
              border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              color: '#c0392b', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
