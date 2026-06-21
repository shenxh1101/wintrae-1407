import { useEffect, useState, useMemo } from 'react';
import { Plus, Filter, Calendar, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { LessonRecordCard } from '@/components/lessons/LessonRecordCard';
import { LessonRecordForm } from '@/components/lessons/LessonRecordForm';
import { useLessonStore } from '@/store/useLessonStore';
import { useStudentStore } from '@/store/useStudentStore';
import type { LessonRecord } from '@/types';
import { formatDate } from '@/utils/date';

export const Lessons = () => {
  const { records, loading, fetchAll, create, update, remove } = useLessonStore();
  const { students, fetchAll: fetchStudents } = useStudentStore();
  const [studentFilter, setStudentFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);
  const [defaultStudentId, setDefaultStudentId] = useState<number | undefined>(undefined);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<LessonRecord | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchAll();
  }, [fetchStudents, fetchAll]);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    students.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [students]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchStudent = !studentFilter || r.studentId.toString() === studentFilter;
      const matchMonth = !monthFilter || r.date.startsWith(monthFilter);
      return matchStudent && matchMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, studentFilter, monthFilter]);

  const stats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthRecords = records.filter(r => r.date.startsWith(thisMonth));
    const withAudio = records.filter(r => r.demonstrationAudio).length;
    const hasGoals = records.filter(r => r.nextGoals).length;
    
    return {
      total: records.length,
      thisMonth: monthRecords.length,
      withAudio,
      hasGoals,
    };
  }, [records]);

  const handleAdd = () => {
    setEditingRecord(null);
    setDefaultStudentId(undefined);
    setDefaultDate(undefined);
    setShowForm(true);
  };

  const handleEdit = (record: LessonRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteClick = (record: LessonRecord) => {
    setDeletingRecord(record);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (deletingRecord) {
      await remove(Number(deletingRecord.id));
      setShowDeleteConfirm(false);
      setDeletingRecord(null);
    }
  };

  const handleSubmit = async (data: Omit<LessonRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      await update(Number(editingRecord.id), data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    records.forEach(r => monthSet.add(r.date.slice(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [records]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title mb-0">课堂记录</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加记录
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总记录数"
          value={stats.total}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          title="本月记录"
          value={stats.thisMonth}
          icon={<Calendar className="w-5 h-5" />}
          valueColor="text-primary-600"
        />
        <StatCard
          title="带音频记录"
          value={stats.withAudio}
          icon={<FileText className="w-5 h-5" />}
          valueColor="text-accent-mint"
        />
        <StatCard
          title="含目标记录"
          value={stats.hasGoals}
          icon={<TrendingUp className="w-5 h-5" />}
          valueColor="text-accent-gold"
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-48">
          <Select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            options={[
              { value: '', label: '全部学生' },
              ...students.map(s => ({ value: s.id.toString(), label: s.name })),
            ]}
          />
        </div>
        <div className="w-40">
          <Select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            options={[
              { value: '', label: '全部月份' },
              ...months.map(m => ({ value: m, label: m.replace('-', '年') + '月' })),
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">加载中...</div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">暂无课堂记录</p>
          <Button onClick={handleAdd}>添加第一条记录</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredRecords.map(record => (
              <LessonRecordCard
                key={record.id}
                record={record}
                studentName={studentMap[record.studentId]}
                onEdit={() => handleEdit(record)}
                onDelete={() => handleDeleteClick(record)}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingRecord(null); }}
        title={editingRecord ? '编辑课堂记录' : '添加课堂记录'}
        size="xl"
      >
        <LessonRecordForm
          record={editingRecord}
          students={students}
          defaultStudentId={defaultStudentId}
          defaultDate={defaultDate}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingRecord(null); }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingRecord(null); }}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            确定要删除 {studentMap[deletingRecord?.studentId || 0]} 在 {deletingRecord?.date && formatDate(deletingRecord.date)} 的课堂记录吗？
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletingRecord(null); }}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
