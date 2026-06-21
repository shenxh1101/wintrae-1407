import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Homework, Student } from '@/types';

interface HomeworkFormProps {
  homework?: Homework | null;
  students: Student[];
  defaultStudentId?: number;
  onSubmit: (data: Omit<Homework, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const HomeworkForm = ({ homework, students, defaultStudentId, onSubmit, onCancel }: HomeworkFormProps) => {
  const [formData, setFormData] = useState({
    studentId: defaultStudentId || 0,
    pieceName: '',
    composer: '',
    assignedDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'paused',
    notes: '',
  });

  useEffect(() => {
    if (homework) {
      setFormData({
        studentId: homework.studentId,
        pieceName: homework.pieceName,
        composer: homework.composer || '',
        assignedDate: homework.assignedDate,
        dueDate: homework.dueDate || '',
        status: homework.status,
        notes: homework.notes || '',
      });
    }
  }, [homework]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.pieceName.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="学生 *"
          value={formData.studentId.toString()}
          onChange={(e) => handleChange('studentId', parseInt(e.target.value))}
          options={[
            { value: '', label: '请选择学生' },
            ...students.map(s => ({ value: s.id.toString(), label: s.name })),
          ]}
          required
        />
        <Input
          label="曲名 *"
          value={formData.pieceName}
          onChange={(e) => handleChange('pieceName', e.target.value)}
          placeholder="如：月光奏鸣曲"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="作曲家"
          value={formData.composer}
          onChange={(e) => handleChange('composer', e.target.value)}
          placeholder="如：贝多芬"
        />
        <Select
          label="状态"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'pending', label: '待开始' },
            { value: 'in_progress', label: '进行中' },
            { value: 'completed', label: '已完成' },
            { value: 'paused', label: '已暂停' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="布置日期 *"
          type="date"
          value={formData.assignedDate}
          onChange={(e) => handleChange('assignedDate', e.target.value)}
          required
        />
        <Input
          label="截止日期"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>

      <Textarea
        label="备注"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="作业备注、整体要求等..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {homework ? '保存修改' : '添加作业'}
        </Button>
      </div>
    </form>
  );
};
