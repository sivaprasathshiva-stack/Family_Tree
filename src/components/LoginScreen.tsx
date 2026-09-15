import { TreePine } from 'lucide-react';

export default function LoginScreen() {
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f7f4', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px 32px', maxWidth: '360px', width: '100%',
        textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <TreePine size={28} color="#2563eb" />
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>Family Tree</h1>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b5f54', lineHeight: 1.5 }}>
          Sign in to view and edit your family tree.
        </p>
        <button
          onClick={() => { window.location.href = '/api/auth/login'; }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '11px', border: '1.5px solid #e8e4de', borderRadius: '10px',
            background: '#fff', color: '#1a1a1a', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
