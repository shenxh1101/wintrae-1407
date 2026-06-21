import { useDraggable } from '@dnd-kit/core';
import { Clock, User, MoreHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';

interface LessonCardProps {
  lesson: Lesson;
  studentName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const typeConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
  regular: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', label: '固定课' },
  makeup: { bg: 'bg-accent-gold/10', border: 'border-accent-gold/30', text: 'text-amber-700', label: '补课' },
  leave: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600', label: '请假' },
};

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  scheduled: { variant: 'default', label: '待上课' },
  completed: { variant: 'success', label: '已完成' },
  cancelled: { variant: 'danger', label: '已取消' },
};

export const LessonCard = ({ lesson, studentName, onEdit, onDelete, isDragging }: LessonCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lesson.id.toString(),
    data: { lesson },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const config = typeConfig[lesson.type] || typeConfig.regular;
  const status = statusConfig[lesson.status] || statusConfig.scheduled;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 group relative',
        config.bg,
        config.border,
        isDragging && 'shadow-xl scale-105 z-50 opacity-90',
        'hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className={cn('text-xs font-medium', config.text)}>{config.label}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1 rounded hover:bg-white/50"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {studentName && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <User className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{studentName}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span>{lesson.startTime} - {lesson.endTime}</span>
      </div>

      {lesson.notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lesson.notes}</p>
      )}

      {lesson.type === 'leave' && (
        <div className="absolute inset-0 bg-gray-200/30 flex items-center justify-center rounded-lg">
          <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded">
            已请假
          </span>
        </div>
      )}
    </div>
  );
};
