import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentForm } from '@/components/students/StudentForm';
import { StudentDetail } from '@/components/students/StudentDetail';
import { useStudentStore } from '@/store/useStudentStore';
import type { Student } from '@/types';

export const Students = () => {
  const { students, loading, fetchAll, fetchStats, studentStats, create, update, remove } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    students.forEach(s => {
      if (!studentStats[s.id]) {
        fetchStats(Number(s.id));
      }
    });
  }, [students, fetchStats, studentStats]);

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.parentName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLevel = !levelFilter || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const handleAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (deletingStudent) {
      await remove(deletingStudent.id);
      setShowDeleteConfirm(false);
      setDeletingStudent(null);
    }
  };

  const handleSubmit = async (data: Omit<Student, 'id' | 'createdAt'>) => {
    if (editingStudent) {
      await update(editingStudent.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingStudent(null);
  };

  if (selectedStudent) {
    return (
      <div className="h-full">
        <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="mb-4">
          ← 返回列表
        </Button>
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            setEditingStudent(selectedStudent);
            setShowForm(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title mb-0">学生档案</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加学生
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索学生姓名或家长姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-40">
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            options={[
              { value: '', label: '全部水平' },
              { value: '初级', label: '初级' },
              { value: '中级', label: '中级' },
              { value: '高级', label: '高级' },
              { value: '专业', label: '专业' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">加载中...</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">暂无学生数据</p>
          <Button onClick={handleAdd}>添加第一个学生</Button>
        </div>
      ) : (
        <div className="grid-auto-fit flex-1">
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              stats={studentStats[student.id]}
              onSelect={() => setSelectedStudent(student)}
              onEdit={() => handleEdit(student)}
              onDelete={() => handleDeleteClick(student)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingStudent(null); }}
        title={editingStudent ? '编辑学生' : '添加学生'}
        size="lg"
      >
        <StudentForm
          student={editingStudent}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingStudent(null); }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingStudent(null); }}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            确定要删除学生 <span className="font-semibold">{deletingStudent?.name}</span> 吗？
            此操作将同时删除该学生的所有课程记录、作业和账单数据，且无法恢复。
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletingStudent(null); }}>
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
