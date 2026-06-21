import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { BillingRecord, Student } from '@/types';

interface BillingFormProps {
  record?: BillingRecord | null;
  students: Student[];
  defaultStudentId?: number;
  onSubmit: (data: Omit<BillingRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const BillingForm = ({ record, students, defaultStudentId, onSubmit, onCancel }: BillingFormProps) => {
  const [formData, setFormData] = useState({
    studentId: defaultStudentId || 0,
    date: new Date().toISOString().slice(0, 10),
    type: 'lesson' as 'lesson' | 'material' | 'other',
    description: '',
    amount: 0,
    isPaid: false,
    lessonHours: 1,
    materialName: '',
    notes: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        studentId: record.studentId,
        date: record.date,
        type: record.type,
        description: record.description,
        amount: record.amount,
        isPaid: record.isPaid,
        lessonHours: record.lessonHours || 1,
        materialName: record.materialName || '',
        notes: record.notes || '',
      });
    }
  }, [record]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.description.trim() || formData.amount <= 0) return;
    
    const submitData: Omit<BillingRecord, 'id' | 'createdAt'> = {
      studentId: formData.studentId,
      date: formData.date,
      type: formData.type,
      description: formData.description,
      amount: formData.amount,
      isPaid: formData.isPaid,
      lessonHours: formData.type === 'lesson' ? formData.lessonHours : undefined,
      materialName: formData.type === 'material' ? formData.materialName : undefined,
      notes: formData.notes || undefined,
    };
    
    onSubmit(submitData);
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
          label="日期 *"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="类型 *"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as 'lesson' | 'material' | 'other')}
          options={[
            { value: 'lesson', label: '课时费' },
            { value: 'material', label: '材料费' },
            { value: 'other', label: '其他费用' },
          ]}
        />
        <Input
          label="金额 (¥) *"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          placeholder="0.00"
          required
        />
      </div>

      <Input
        label="描述 *"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder={formData.type === 'lesson' ? '如：12月第2周课时' : formData.type === 'material' ? '如：乐谱教材费' : '费用描述'}
        required
      />

      {formData.type === 'lesson' && (
        <Input
          label="课时数"
          type="number"
          min="0.5"
          step="0.5"
          value={formData.lessonHours}
          onChange={(e) => handleChange('lessonHours', parseFloat(e.target.value))}
        />
      )}

      {formData.type === 'material' && (
        <Input
          label="材料名称"
          value={formData.materialName}
          onChange={(e) => handleChange('materialName', e.target.value)}
          placeholder="如：钢琴基础教程1"
        />
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPaid"
          checked={formData.isPaid}
          onChange={(e) => handleChange('isPaid', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
          已支付
        </label>
      </div>

      <Textarea
        label="备注"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="费用相关的备注信息..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {record ? '保存修改' : '添加账单'}
        </Button>
      </div>
    </form>
  );
};
