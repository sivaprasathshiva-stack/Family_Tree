import { User } from 'lucide-react';
import type { Gender } from '../types';
import { genderClasses } from '../theme';

interface AvatarProps {
  photo?: string;
  name: string;
  gender: Gender;
  size?: number;
  className?: string;
}

// A person's photo, or a generic gender-tinted avatar when none is set.
export default function Avatar({ photo, name, gender, size = 32, className = '' }: AvatarProps) {
  const c = genderClasses(gender);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${c.bg} ${className}`}
      style={{ width: size, height: size }}
    >
      {photo
        ? <img src={photo} alt={name} className="h-full w-full object-cover" />
        : <User size={Math.round(size * 0.55)} className={c.text} strokeWidth={2} />
      }
    </div>
  );
}
