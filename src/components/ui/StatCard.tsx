import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  valueColor?: string;
}

export const StatCard = ({ title, value, icon, trend, className, valueColor }: StatCardProps) => {
  return (
    <div className={cn(
      'bg-white rounded-xl p-5 shadow-soft border border-gray-100',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={cn(
            'text-2xl font-bold font-serif',
            valueColor || 'text-gray-900'
          )}>
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          'mt-3 text-sm font-medium flex items-center gap-1',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-gray-400 font-normal">vs 上月</span>
        </div>
      )}
    </div>
  );
};
