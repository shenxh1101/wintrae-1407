import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colors = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-cyan-100 text-cyan-700',
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
];

export const Avatar = ({ name, size = 'md', className }: AvatarProps) => {
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const initial = name.charAt(0).toUpperCase();

  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold',
      colors[colorIndex],
      sizes[size],
      className
    )}>
      {initial || <User className="w-5 h-5" />}
    </div>
  );
};
