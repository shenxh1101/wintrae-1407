import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';
import { LessonCard } from './LessonCard';

interface TimeSlotProps {
  dayIndex: number;
  hour: number;
  lessons: Lesson[];
  studentMap: Record<number, string>;
  onEditLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (lesson: Lesson) => void;
  onSlotClick?: (dayIndex: number, hour: number) => void;
}

export const TimeSlot = ({ dayIndex, hour, lessons, studentMap, onEditLesson, onDeleteLesson, onSlotClick }: TimeSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dayIndex}-${hour}`,
    data: { dayIndex, hour },
  });

  const displayHour = hour.toString().padStart(2, '0') + ':00';
  const isEvening = hour >= 18;

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSlotClick?.(dayIndex, hour)}
      className={cn(
        'min-h-[80px] p-1.5 border-b border-r border-gray-100 transition-all duration-200',
        isOver && 'bg-primary-50 border-primary-300',
        isEvening ? 'bg-gray-50/50' : 'bg-white',
        'hover:bg-gray-50 cursor-pointer'
      )}
    >
      {lessons.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-gray-300 opacity-0 hover:opacity-100 transition-opacity">
          {displayHour} 可排课
        </div>
      ) : (
        <div className="space-y-1.5">
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              studentName={studentMap[lesson.studentId]}
              onEdit={() => onEditLesson?.(lesson)}
              onDelete={() => onDeleteLesson?.(lesson)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
