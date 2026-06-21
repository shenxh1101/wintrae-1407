import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500 shadow-sm hover:shadow-md',
      secondary: 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'bg-transparent text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      danger: 'bg-accent-coral text-white hover:bg-red-600 focus:ring-red-400',
      success: 'bg-accent-mint text-white hover:bg-green-600 focus:ring-green-400',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
