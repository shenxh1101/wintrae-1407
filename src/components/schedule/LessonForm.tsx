import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Lesson, Student } from '@/types';

interface LessonFormProps {
  lesson?: Lesson | null;
  students: Student[];
  defaultDay?: number;
  defaultHour?: number;
  onSubmit: (data: Omit<Lesson, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const hours = Array.from({ length: 14 }, (_, i) => i + 8);

export const LessonForm = ({ lesson, students, defaultDay, defaultHour, onSubmit, onCancel }: LessonFormProps) => {
  const [formData, setFormData] = useState({
    studentId: 0,
    dayOfWeek: defaultDay ?? 0,
    startTime: '',
    endTime: '',
    type: 'regular' as 'regular' | 'makeup' | 'leave',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        studentId: lesson.studentId,
        dayOfWeek: lesson.dayOfWeek,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        type: lesson.type,
        status: lesson.status,
        notes: lesson.notes || '',
      });
    } else if (defaultHour !== undefined) {
      const hourStr = defaultHour.toString().padStart(2, '0');
      const endHour = (defaultHour + 1).toString().padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        startTime: `${hourStr}:00`,
        endTime: `${endHour}:00`,
        dayOfWeek: defaultDay ?? prev.dayOfWeek,
      }));
    }
  }, [lesson, defaultDay, defaultHour]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.startTime || !formData.endTime) return;
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
        <Select
          label="星期 *"
          value={formData.dayOfWeek.toString()}
          onChange={(e) => handleChange('dayOfWeek', parseInt(e.target.value))}
          options={weekDays.map((day, i) => ({ value: i.toString(), label: day }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="开始时间 *"
          value={formData.startTime}
          onChange={(e) => handleChange('startTime', e.target.value)}
          options={hours.map(h => {
            const str = h.toString().padStart(2, '0');
            return { value: `${str}:00`, label: `${str}:00` };
          })}
          required
        />
        <Select
          label="结束时间 *"
          value={formData.endTime}
          onChange={(e) => handleChange('endTime', e.target.value)}
          options={hours.map(h => {
            const str = (h + 1).toString().padStart(2, '0');
            return { value: `${str}:00`, label: `${str}:00` };
          })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="课程类型"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={[
            { value: 'regular', label: '固定课' },
            { value: 'makeup', label: '临时补课' },
            { value: 'leave', label: '请假' },
          ]}
        />
        <Select
          label="课程状态"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'scheduled', label: '待上课' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
      </div>

      <Textarea
        label="备注"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="课程备注，如特殊要求、曲目准备等..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {lesson ? '保存修改' : '添加课程'}
        </Button>
      </div>
    </form>
  );
};
