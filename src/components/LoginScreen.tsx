import { TreePine } from 'lucide-react';

export default function LoginScreen() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />

      <div className="animate-scale-in relative w-full max-w-[380px] rounded-3xl border border-slate-200/60 bg-white/90 p-9 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200">
          <TreePine size={30} className="text-white" />
        </div>
        <h1 className="m-0 mb-2 text-2xl font-bold tracking-tight text-slate-900">Family Tree</h1>
        <p className="m-0 mb-7 text-[14px] leading-relaxed text-slate-500">
          Sign in with Google to view and grow your family's story together.
        </p>
        <button
          onClick={() => { window.location.href = '/api/auth/login'; }}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          <svg width="19" height="19" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Sign in with Google
        </button>
        <p className="m-0 mt-6 text-[11px] text-slate-400">
          Works with any Google account — share it with family to invite them.
        </p>
      </div>

      <p className="animate-fade-in relative mt-7 max-w-[380px] px-4 text-center text-[13px] italic leading-relaxed text-slate-400 sm:absolute sm:bottom-8 sm:mt-0">
        “Know your roots. Cherish your connections.”
      </p>
    </div>
  );
}
