import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Student } from '@/types';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const StudentForm = ({ student, onSubmit, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    level: '',
    preferredGenres: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    notes: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        birthDate: student.birthDate || '',
        level: student.level || '',
        preferredGenres: student.preferredGenres || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        notes: student.notes || '',
      });
    }
  }, [student]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="学生姓名 *"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="请输入学生姓名"
          required
        />
        <Input
          label="出生日期"
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleChange('birthDate', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="学习水平"
          value={formData.level}
          onChange={(e) => handleChange('level', e.target.value)}
          options={[
            { value: '', label: '请选择' },
            { value: '初级', label: '初级' },
            { value: '中级', label: '中级' },
            { value: '高级', label: '高级' },
            { value: '专业', label: '专业' },
          ]}
        />
        <Input
          label="曲目偏好"
          value={formData.preferredGenres}
          onChange={(e) => handleChange('preferredGenres', e.target.value)}
          placeholder="如：古典、浪漫、流行"
        />
      </div>

      <div className="border-t border-gray-100 pt-5 mt-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">家长联系方式</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="家长姓名"
            value={formData.parentName}
            onChange={(e) => handleChange('parentName', e.target.value)}
            placeholder="请输入家长姓名"
          />
          <Input
            label="联系电话"
            value={formData.parentPhone}
            onChange={(e) => handleChange('parentPhone', e.target.value)}
            placeholder="请输入联系电话"
          />
        </div>
        <div className="mt-4">
          <Input
            label="电子邮箱"
            type="email"
            value={formData.parentEmail}
            onChange={(e) => handleChange('parentEmail', e.target.value)}
            placeholder="请输入电子邮箱"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 mt-2">
        <Textarea
          label="备注"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="记录学生特点、学习目标等重要信息..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {student ? '保存修改' : '添加学生'}
        </Button>
      </div>
    </form>
  );
};
