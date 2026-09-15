import type { Gender } from './types';

// Hex tokens — for contexts that can't use Tailwind classes (React Flow inline
// styles, the MiniMap's nodeColor callback, canvas/SVG props).
export const GENDER_COLORS: Record<Gender, { bg: string; border: string; text: string; solid: string }> = {
  male: { bg: '#f0f9ff', border: '#7dd3fc', text: '#0369a1', solid: '#0ea5e9' },
  female: { bg: '#fdf2f8', border: '#f9a8d4', text: '#be185d', solid: '#ec4899' },
  other: { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9', solid: '#8b5cf6' },
  unknown: { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', solid: '#64748b' },
};

// Tailwind class tokens — for component markup.
export const GENDER_CLASSES: Record<Gender, { bg: string; border: string; text: string; chip: string; solidBg: string }> = {
  male: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700', chip: 'bg-sky-100 text-sky-700', solidBg: 'bg-sky-400' },
  female: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', chip: 'bg-pink-100 text-pink-700', solidBg: 'bg-pink-400' },
  other: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', chip: 'bg-violet-100 text-violet-700', solidBg: 'bg-violet-400' },
  unknown: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', chip: 'bg-slate-200 text-slate-600', solidBg: 'bg-slate-400' },
};

export function genderClasses(gender: Gender) {
  return GENDER_CLASSES[gender] ?? GENDER_CLASSES.unknown;
}

export function genderColors(gender: Gender) {
  return GENDER_COLORS[gender] ?? GENDER_COLORS.unknown;
}
