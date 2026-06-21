import { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { TimeSlot } from '@/components/schedule/TimeSlot';
import { LessonCard } from '@/components/schedule/LessonCard';
import { LessonForm } from '@/components/schedule/LessonForm';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import type { Lesson } from '@/types';
import { getWeekRange, formatDate, getMonthLabel } from '@/utils/date';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const hours = Array.from({ length: 14 }, (_, i) => i + 8);

export const Schedule = () => {
  const { lessons, loading, fetchWeek, create, update, remove, moveLesson } = useScheduleStore();
  const { students, fetchAll: fetchStudents } = useStudentStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<{ day: number; hour: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    students.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [students]);

  const lessonsBySlot = useMemo(() => {
    const slots: Record<string, Lesson[]> = {};
    lessons.forEach(lesson => {
      const hour = parseInt(lesson.startTime.split(':')[0]);
      const key = `${lesson.dayOfWeek}-${hour}`;
      if (!slots[key]) slots[key] = [];
      slots[key].push(lesson);
    });
    return slots;
  }, [lessons]);

  const weekStats = useMemo(() => {
    const total = lessons.length;
    const completed = lessons.filter(l => l.status === 'completed').length;
    const cancelled = lessons.filter(l => l.status === 'cancelled' || l.type === 'leave').length;
    const scheduled = total - completed - cancelled;
    return { total, completed, cancelled, scheduled };
  }, [lessons]);

  const goToPrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveLesson(active.data.current?.lesson as Lesson);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLesson(null);

    if (!over) return;

    const activeLesson = active.data.current?.lesson as Lesson;
    const overId = over.id.toString();

    if (!overId.startsWith('slot-')) return;

    const [, dayIndex, hour] = overId.split('-').map(Number);
    const newStartTime = hour.toString().padStart(2, '0') + ':00';
    const newEndTime = (hour + 1).toString().padStart(2, '0') + ':00';

    moveLesson(activeLesson.id, dayIndex, newStartTime, newEndTime);
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setEditingLesson(null);
    setDefaultSlot({ day: dayIndex, hour });
    setShowForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setDefaultSlot(null);
    setShowForm(true);
  };

  const handleDeleteClick = (lesson: Lesson) => {
    setDeletingLesson(lesson);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (deletingLesson) {
      await remove(Number(deletingLesson.id));
      setShowDeleteConfirm(false);
      setDeletingLesson(null);
    }
  };

  const handleSubmit = async (data: Omit<Lesson, 'id' | 'createdAt'>) => {
    if (editingLesson) {
      await update(Number(editingLesson.id), data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingLesson(null);
    setDefaultSlot(null);
  };

  const today = new Date();
  const todayDayIndex = (today.getDay() + 6) % 7;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="page-title mb-0">课表</h2>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <Button variant="ghost" size="sm" onClick={goToPrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              本周
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{getMonthLabel(weekRange.start)}</span>
            <span className="mx-2">{formatDate(weekRange.start)} - {formatDate(weekRange.end)}</span>
          </div>
        </div>
        <Button onClick={() => { setEditingLesson(null); setDefaultSlot(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          添加课程
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="本周总课数"
          value={weekStats.total}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="待上课"
          value={weekStats.scheduled}
          icon={<Calendar className="w-5 h-5" />}
          valueColor="text-primary-600"
        />
        <StatCard
          title="已完成"
          value={weekStats.completed}
          icon={<Calendar className="w-5 h-5" />}
          valueColor="text-accent-mint"
        />
        <StatCard
          title="已取消/请假"
          value={weekStats.cancelled}
          icon={<Calendar className="w-5 h-5" />}
          valueColor="text-accent-coral"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Badge variant="default">固定课</Badge>
        <Badge variant="warning">补课</Badge>
        <Badge variant="info">请假</Badge>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
            <div className="p-3 text-center text-xs text-gray-500 border-r border-gray-200">
              时间
            </div>
            {weekDays.map((day, i) => {
              const date = new Date(weekRange.start);
              date.setDate(date.getDate() + i);
              const isToday = i === todayDayIndex && 
                date.toDateString() === today.toDateString();
              
              return (
                <div
                  key={day}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{day}</div>
                  <div className={`text-lg font-bold font-serif ${
                    isToday ? 'text-primary-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  {isToday && (
                    <Badge variant="gold" className="mt-1">今天</Badge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="p-2 text-right text-xs text-gray-500 border-b border-r border-gray-200 sticky left-0 bg-gray-50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((_, dayIndex) => (
                  <TimeSlot
                    key={`${dayIndex}-${hour}`}
                    dayIndex={dayIndex}
                    hour={hour}
                    lessons={lessonsBySlot[`${dayIndex}-${hour}`] || []}
                    studentMap={studentMap}
                    onEditLesson={handleEditLesson}
                    onDeleteLesson={handleDeleteClick}
                    onSlotClick={handleSlotClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLesson && (
            <div className="w-64 opacity-90">
              <LessonCard
                lesson={activeLesson}
                studentName={studentMap[activeLesson.studentId]}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingLesson(null); setDefaultSlot(null); }}
        title={editingLesson ? '编辑课程' : '添加课程'}
        size="lg"
      >
        <LessonForm
          lesson={editingLesson}
          students={students}
          defaultDay={defaultSlot?.day}
          defaultHour={defaultSlot?.hour}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingLesson(null); setDefaultSlot(null); }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingLesson(null); }}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            确定要删除 {studentMap[deletingLesson?.studentId || 0]} 的课程吗？
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletingLesson(null); }}>
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
