import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { PracticeSection } from '@/types';

interface SectionFormProps {
  section?: PracticeSection | null;
  homeworkId: number;
  onSubmit: (data: Omit<PracticeSection, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const SectionForm = ({ section, homeworkId, onSubmit, onCancel }: SectionFormProps) => {
  const [formData, setFormData] = useState({
    homeworkId,
    sectionName: '',
    measures: '',
    practiceNotes: '',
    status: 'pending' as 'pending' | 'passed' | 'needs_review' | 'paused',
  });

  useEffect(() => {
    if (section) {
      setFormData({
        homeworkId: section.homeworkId,
        sectionName: section.sectionName,
        measures: section.measures || '',
        practiceNotes: section.practiceNotes || '',
        status: section.status,
      });
    }
  }, [section, homeworkId]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sectionName.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <Input
        label="段落名称 *"
        value={formData.sectionName}
        onChange={(e) => handleChange('sectionName', e.target.value)}
        placeholder="如：第一乐章、引子、主旋律"
        required
      />

      <Input
        label="小节范围"
        value={formData.measures}
        onChange={(e) => handleChange('measures', e.target.value)}
        placeholder="如：1-16 小节"
      />

      <Select
        label="状态"
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value)}
        options={[
          { value: 'pending', label: '待练习' },
          { value: 'passed', label: '通过' },
          { value: 'needs_review', label: '需重练' },
          { value: 'paused', label: '暂停' },
        ]}
      />

      <Textarea
        label="练习要求"
        value={formData.practiceNotes}
        onChange={(e) => handleChange('practiceNotes', e.target.value)}
        placeholder="详细的练习要求、注意事项、重点难点..."
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {section ? '保存修改' : '添加段落'}
        </Button>
      </div>
    </form>
  );
};
