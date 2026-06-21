import { Calendar, Clock, Music, FileText, Edit2, Trash2, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { LessonRecord } from '@/types';
import { formatDate } from '@/utils/date';

interface LessonRecordCardProps {
  record: LessonRecord;
  studentName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const LessonRecordCard = ({ record, studentName, onEdit, onDelete }: LessonRecordCardProps) => {
  const hasAudio = record.demonstrationAudio && record.demonstrationAudio.length > 0;

  return (
    <Card hoverable className="group">
      <Card.Body className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-medium text-primary-600">
                {formatDate(record.date)}
              </span>
              {hasAudio && (
                <Badge variant="info">
                  <Play className="w-3 h-3 mr-1" />
                  有示范音频
                </Badge>
              )}
            </div>
            {studentName && (
              <h3 className="font-semibold text-gray-900 font-serif">{studentName}</h3>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {record.keyPoints && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">重点问题</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
              {record.keyPoints}
            </p>
          </div>
        )}

        {record.nextGoals && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">下次目标</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
              {record.nextGoals}
            </p>
          </div>
        )}

        {hasAudio && (
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
            <button className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
              <Play className="w-5 h-5 ml-0.5" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">示范音频</p>
              <p className="text-xs text-gray-500">点击播放</p>
            </div>
          </div>
        )}

        {record.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">备注</p>
            <p className="text-sm text-gray-600 line-clamp-2">{record.notes}</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
