import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: ReactNode;
}

export const Badge = ({ variant = 'default', size = 'md', className, children }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-amber-100 text-amber-700',
    primary: 'bg-primary-100 text-primary-700',
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      sizes[size],
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
