import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Students } from '@/pages/Students';
import { Schedule } from '@/pages/Schedule';
import { Lessons } from '@/pages/Lessons';
import { Homework } from '@/pages/Homework';
import { Billing } from '@/pages/Billing';

const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '学生档案', subtitle: '管理学生基本信息和学习进度' },
  '/schedule': { title: '课表', subtitle: '查看和安排课程时间' },
  '/lessons': { title: '课堂记录', subtitle: '记录每节课的重点和目标' },
  '/homework': { title: '作业追踪', subtitle: '管理练习曲目和录音反馈' },
  '/billing': { title: '账单', subtitle: '课时费、材料费统计与报告导出' },
};

function AppContent() {
  const location = useLocation();
  const header = pageHeaders[location.pathname] || pageHeaders['/'];

  return (
    <div className="flex min-h-screen bg-neutral-ivory">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={header.title} subtitle={header.subtitle} />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Students />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/billing" element={<Billing />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
