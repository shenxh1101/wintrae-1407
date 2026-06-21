import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export const Tabs = ({ tabs, defaultTab, onChange, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex space-x-1 border-b border-gray-200 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-primary-700 border-primary-700'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">
        {children(activeTab)}
      </div>
    </div>
  );
};
