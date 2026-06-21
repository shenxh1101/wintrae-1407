import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({ className, children, onClick, hoverable = false }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden',
        hoverable && 'cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

Card.Header = ({ className, children }: CardHeaderProps) => (
  <div className={cn('px-5 py-4 border-b border-gray-100', className)}>
    {children}
  </div>
);

interface CardBodyProps {
  className?: string;
  children: ReactNode;
}

Card.Body = ({ className, children }: CardBodyProps) => (
  <div className={cn('px-5 py-4', className)}>
    {children}
  </div>
);

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

Card.Footer = ({ className, children }: CardFooterProps) => (
  <div className={cn('px-5 py-4 border-t border-gray-100 bg-gray-50', className)}>
    {children}
  </div>
);
