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
    <div className="animate-fade-in fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="animate-scale-in flex w-full max-w-[380px] flex-col gap-3.5 rounded-3xl bg-white p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${confirmDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="m-0 mb-1 text-base font-bold text-slate-900">{title}</h3>
            <p className="m-0 text-sm leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>

        {warning && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-[13px] text-orange-700">
            {warning}
          </div>
        )}

        <div className="mt-1 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border-[1.5px] border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 ${
              confirmDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
