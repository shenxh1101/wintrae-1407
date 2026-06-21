import { useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Music2, 
  BookOpen,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Student, StudentStats, LessonRecord, Homework, BillingRecord } from '@/types';
import { formatDate, calculateAge } from '@/utils/date';
import { useStudentStore } from '@/store/useStudentStore';
import { useLessonStore } from '@/store/useLessonStore';
import { useHomeworkStore } from '@/store/useHomeworkStore';
import { useBillingStore } from '@/store/useBillingStore';
import { generateStudentReport } from '@/utils/pdf';
import { handleIpcResponse, getApi } from '@/utils/ipc';

interface StudentDetailProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}

export const StudentDetail = ({ student, onClose, onEdit }: StudentDetailProps) => {
  const fetchStats = useStudentStore(state => state.fetchStats);
  const stats = useStudentStore(state => state.studentStats[student.id]);
  const { records, fetchAll: fetchRecords } = useLessonStore();
  const { homeworkList, fetchAll: fetchHomework } = useHomeworkStore();
  const { records: billingRecords, fetchAll: fetchBilling } = useBillingStore();

  useEffect(() => {
    fetchStats(Number(student.id));
    fetchRecords(Number(student.id));
    fetchHomework(Number(student.id));
    fetchBilling(Number(student.id));
  }, [student.id, fetchStats, fetchRecords, fetchHomework, fetchBilling]);

  const age = student.birthDate ? calculateAge(student.birthDate) : null;
  const studentRecords = records.filter(r => r.studentId === student.id);
  const studentHomework = homeworkList.filter(h => h.studentId === student.id);
  const studentBilling = billingRecords.filter(b => b.studentId === student.id);

  const handleExportReport = async () => {
    if (!stats) return;
    try {
      const arrayBuffer = await generateStudentReport(
        student,
        stats,
        studentRecords,
        studentHomework,
        studentBilling
      );
      const api = getApi();
      const fileName = `${student.name}_学习报告_${formatDate(new Date())}.pdf`;
      await handleIpcResponse(await api.files.savePdf(fileName, arrayBuffer));
      alert('报告导出成功！');
    } catch (error) {
      console.error('导出报告失败:', error);
      alert('导出报告失败，请重试');
    }
  };

  const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
    pending: { label: '待开始', variant: 'default' },
    in_progress: { label: '进行中', variant: 'warning' },
    completed: { label: '已完成', variant: 'success' },
    paused: { label: '已暂停', variant: 'info' },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 font-serif">{student.name}</h2>
              {student.level && (
                <Badge variant="info">{student.level}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {age && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {age}岁
                </span>
              )}
              {student.preferredGenres && (
                <span className="flex items-center gap-1">
                  <Music2 className="w-4 h-4" />
                  {student.preferredGenres}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEdit}>
            编辑信息
          </Button>
          <Button variant="primary" onClick={handleExportReport}>
            导出报告
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="累计课时"
            value={stats.totalLessons}
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatCard
            title="已完成作业"
            value={stats.completedHomework}
            icon={<FileText className="w-5 h-5" />}
            valueColor="text-accent-mint"
          />
          <StatCard
            title="待完成作业"
            value={stats.pendingHomework}
            icon={<TrendingUp className="w-5 h-5" />}
            valueColor="text-accent-gold"
          />
          <StatCard
            title="待缴费用"
            value={`¥${stats.unpaidAmount}`}
            icon={<TrendingUp className="w-5 h-5" />}
            valueColor={stats.unpaidAmount > 0 ? 'text-accent-coral' : 'text-accent-mint'}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900 font-serif">基本信息</h3>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="label-text w-20">姓名</span>
              <span className="value-text">{student.name}</span>
            </div>
            {student.birthDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="label-text w-20">生日</span>
                <span className="value-text">{formatDate(student.birthDate)}</span>
              </div>
            )}
            {student.parentName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="label-text w-20">家长</span>
                <span className="value-text">{student.parentName}</span>
              </div>
            )}
            {student.parentPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="label-text w-20">电话</span>
                <span className="value-text">{student.parentPhone}</span>
              </div>
            )}
            {student.parentEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="label-text w-20">邮箱</span>
                <span className="value-text">{student.parentEmail}</span>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900 font-serif">备注</h3>
          </Card.Header>
          <Card.Body>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {student.notes || '暂无备注信息'}
            </p>
          </Card.Body>
        </Card>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs
          tabs={[
            { id: 'records', label: '课堂记录', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'homework', label: '作业情况', icon: <Music2 className="w-4 h-4" /> },
            { id: 'billing', label: '账单明细', icon: <FileText className="w-4 h-4" /> },
          ]}
          className="h-full flex flex-col"
        >
          {(activeTab) => (
            <div className="flex-1 overflow-auto">
              {activeTab === 'records' && (
                <div className="space-y-3">
                  {studentRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无课堂记录</p>
                  ) : (
                    studentRecords.slice(0, 10).map(record => (
                      <Card key={record.id}>
                        <Card.Body>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-primary-600">
                              {formatDate(record.date)}
                            </span>
                          </div>
                          {record.keyPoints && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">重点问题</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.keyPoints}</p>
                            </div>
                          )}
                          {record.nextGoals && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">下次目标</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.nextGoals}</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'homework' && (
                <div className="space-y-3">
                  {studentHomework.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无作业</p>
                  ) : (
                    studentHomework.slice(0, 10).map(hw => (
                      <Card key={hw.id}>
                        <Card.Body>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{hw.pieceName}</h4>
                              {hw.composer && (
                                <p className="text-sm text-gray-500">{hw.composer}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>布置: {formatDate(hw.assignedDate)}</span>
                                {hw.dueDate && (
                                  <span>截止: {formatDate(hw.dueDate)}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant={statusMap[hw.status]?.variant || 'default'}>
                              {statusMap[hw.status]?.label || hw.status}
                            </Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-3">
                  {studentBilling.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无账单记录</p>
                  ) : (
                    studentBilling.slice(0, 10).map(record => (
                      <Card key={record.id}>
                        <Card.Body>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{record.description}</p>
                              <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">¥{record.amount.toFixed(2)}</p>
                              <Badge variant={record.isPaid ? 'success' : 'warning'}>
                                {record.isPaid ? '已支付' : '未支付'}
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};
