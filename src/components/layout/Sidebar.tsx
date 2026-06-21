import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Music, 
  Receipt,
  Music2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getMonthLabel } from '@/utils/date';

const navItems = [
  { path: '/', label: '学生档案', icon: Users },
  { path: '/schedule', label: '课表', icon: Calendar },
  { path: '/lessons', label: '课堂记录', icon: BookOpen },
  { path: '/homework', label: '作业追踪', icon: Music },
  { path: '/billing', label: '账单', icon: Receipt },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-gold flex items-center justify-center">
            <Music2 className="w-6 h-6 text-primary-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif">音乐工作室</h1>
            <p className="text-xs text-primary-300">管理系统</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-primary-800">
        <p className="text-xs text-primary-400">{formatDate(new Date(), 'EEEE')}</p>
        <p className="text-sm font-medium">{getMonthLabel(new Date())}</p>
        <p className="text-lg font-bold font-serif">{formatDate(new Date(), 'd日')}</p>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-800 text-white shadow-lg'
                      : 'text-primary-200 hover:bg-primary-800/50 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive && 'text-accent-gold'
                  )} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-800">
        <div className="bg-primary-800/50 rounded-lg p-3">
          <p className="text-xs text-primary-300 mb-1">今日课程</p>
          <p className="text-2xl font-bold font-serif text-accent-gold">2</p>
          <p className="text-xs text-primary-400 mt-1">节待上</p>
        </div>
      </div>
    </aside>
  );
};
