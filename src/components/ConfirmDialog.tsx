import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, message, warning, confirmLabel = 'Confirm', confirmDanger = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)', padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ color: '#c0392b', marginTop: '2px' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#4a4540', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>

        {warning && (
          <div style={{
            background: '#fff5f0', border: '1px solid #f5c6b8', borderRadius: '8px', padding: '10px 12px',
            fontSize: '13px', color: '#8b3a2a',
          }}>
            {warning}
          </div>
        )}

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
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
              background: confirmDanger ? '#c0392b' : '#2563eb', color: '#fff',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
