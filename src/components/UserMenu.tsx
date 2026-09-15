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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 ring-offset-2 transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
          {user.picture
            ? <img src={user.picture} alt={user.name || user.email} className="h-full w-full object-cover" />
            : <span className="text-[13px] font-bold text-white">{(user.name || user.email)[0].toUpperCase()}</span>
          }
        </div>
      </button>

      {open && (
        <div className="animate-scale-in absolute right-0 top-11 z-[1100] min-w-[210px] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="truncate text-[13px] font-semibold text-slate-900">{user.name || 'Signed in'}</div>
            <div className="truncate text-[12px] text-slate-400">{user.email}</div>
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
