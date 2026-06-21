import { Edit2, Trash2, BookOpen, Music, DollarSign } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Student, StudentStats } from '@/types';
import { calculateAge } from '@/utils/date';

interface StudentCardProps {
  student: Student;
  stats?: StudentStats;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const levelColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  '初级': 'info',
  '中级': 'warning',
  '高级': 'success',
  '专业': 'danger',
};

export const StudentCard = ({ student, stats, onSelect, onEdit, onDelete }: StudentCardProps) => {
  const age = student.birthDate ? calculateAge(student.birthDate) : null;

  return (
    <Card hoverable onClick={onSelect} className="group">
      <Card.Body className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-serif">{student.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {age && (
                  <span className="text-sm text-gray-500">{age}岁</span>
                )}
                {student.level && (
                  <Badge variant={levelColors[student.level] || 'default'}>
                    {student.level}
                  </Badge>
                )}
              </div>
              {student.preferredGenres && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {student.preferredGenres}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary-600">
                <BookOpen className="w-4 h-4" />
                <span className="text-lg font-bold font-serif">{stats.totalLessons}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">累计课时</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-accent-mint">
                <Music className="w-4 h-4" />
                <span className="text-lg font-bold font-serif">{stats.completedHomework}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">完成作业</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-accent-coral">
                <DollarSign className="w-4 h-4" />
                <span className="text-lg font-bold font-serif">{stats.unpaidAmount > 0 ? stats.unpaidAmount : '-'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">待缴费</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
