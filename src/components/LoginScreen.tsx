import { TreePine, Users, GitBranch, Search } from 'lucide-react';
import heroImage from '../assets/family-tree-hero.png';

export default function LoginScreen() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Left — artwork panel, hidden on small screens */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden lg:block">
        <img src={heroImage} alt="Family lineage tree" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-transparent to-slate-950/70" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="m-0 max-w-sm text-[15px] font-medium leading-relaxed text-white/90 drop-shadow">
            "Know your roots. Cherish your connections."
          </p>
        </div>
      </div>

      {/* Right — sign-in panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 p-4">
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

        {/* Mobile-only hero strip */}
        <div className="relative mb-5 w-full max-w-[380px] overflow-hidden rounded-3xl shadow-lg lg:hidden">
          <img src={heroImage} alt="Family lineage tree" className="h-36 w-full object-cover" />
        </div>

        <div className="animate-scale-in relative w-full max-w-[380px] rounded-3xl border border-slate-200/60 bg-white/90 p-9 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200">
            <TreePine size={30} className="text-white" />
          </div>
          <h1 className="m-0 mb-2 text-2xl font-bold tracking-tight text-slate-900">Family Tree</h1>
          <p className="m-0 mb-6 text-[14px] leading-relaxed text-slate-500">
            Sign in to see your own family circle — parents, grandparents, cousins and everyone connected to you.
          </p>

          <div className="mb-6 grid grid-cols-3 gap-2 text-left">
            <Feature icon={<Users size={15} />} label="Your circle" />
            <Feature icon={<GitBranch size={15} />} label="Full lineage" />
            <Feature icon={<Search size={15} />} label="Find anyone" />
          </div>

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
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-center">
      <span className="text-indigo-500">{icon}</span>
      <span className="text-[10.5px] font-semibold leading-tight text-slate-500">{label}</span>
    </div>
  );
}
