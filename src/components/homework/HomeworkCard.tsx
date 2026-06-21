import { useState } from 'react';
import { ChevronDown, ChevronUp, Music, Edit2, Trash2, Plus, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Homework, PracticeSection, Recording } from '@/types';
import { formatDate } from '@/utils/date';

interface HomeworkCardProps {
  homework: Homework;
  sections: PracticeSection[];
  recordings: Recording[];
  studentName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (section: PracticeSection) => void;
  onDeleteSection: (sectionId: number) => void;
  onUploadRecording: (sectionId: number) => void;
  onUpdateStatus: (sectionId: number, status: 'passed' | 'needs_review' | 'paused') => void;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: '待开始', variant: 'default' },
  in_progress: { label: '进行中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  paused: { label: '已暂停', variant: 'info' },
};

const sectionStatusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info', color: string }> = {
  passed: { label: '通过', variant: 'success', color: 'bg-accent-mint/10 border-accent-mint/30' },
  needs_review: { label: '需重练', variant: 'warning', color: 'bg-accent-gold/10 border-accent-gold/30' },
  paused: { label: '暂停', variant: 'info', color: 'bg-gray-100 border-gray-200' },
  pending: { label: '待练习', variant: 'default', color: 'bg-white border-gray-200' },
};

export const HomeworkCard = ({
  homework,
  sections,
  recordings,
  studentName,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onUploadRecording,
  onUpdateStatus,
}: HomeworkCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const hwStatus = statusMap[homework.status] || statusMap.pending;

  const completedCount = sections.filter(s => s.status === 'passed').length;
  const progress = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

  return (
    <Card className="group">
      <Card.Body className="p-0">
        <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={hwStatus.variant}>{hwStatus.label}</Badge>
                {studentName && (
                  <span className="text-sm text-gray-600">{studentName}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 font-serif text-lg">{homework.pieceName}</h3>
              {homework.composer && (
                <p className="text-sm text-gray-500 mt-1">{homework.composer}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>布置: {formatDate(homework.assignedDate)}</span>
                {homework.dueDate && (
                  <span>截止: {formatDate(homework.dueDate)}</span>
                )}
                <span>段落: {completedCount}/{sections.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-sm font-medium text-gray-900">{progress}%</p>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-accent-mint transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
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
              {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </div>

        {expanded && sections.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="p-4 space-y-3">
              {sections.map(section => {
                const sectionStatus = sectionStatusMap[section.status] || sectionStatusMap.pending;
                const sectionRecordings = recordings.filter(r => r.sectionId === section.id);
                const hasRecording = sectionRecordings.length > 0;

                return (
                  <div 
                    key={section.id} 
                    className={`p-4 rounded-lg border transition-all ${sectionStatus.color}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Music className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{section.sectionName}</span>
                          <Badge variant={sectionStatus.variant}>{sectionStatus.label}</Badge>
                        </div>
                        {section.measures && (
                          <p className="text-xs text-gray-500 mb-2">小节: {section.measures}</p>
                        )}
                        {section.practiceNotes && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{section.practiceNotes}</p>
                        )}
                        {hasRecording && (
                          <div className="mt-3 p-2 bg-white/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">学生录音 ({sectionRecordings.length})</p>
                            {sectionRecordings.slice(0, 2).map(rec => (
                              <div key={rec.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <Check className="w-3 h-3 text-accent-mint" />
                                <span>{formatDate(rec.uploadedDate)} {rec.fileName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onEditSection(section); }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onUploadRecording(section.id); }}
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                        {section.status !== 'passed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(section.id, 'passed'); }}
                            className="text-accent-mint hover:text-accent-mint hover:bg-accent-mint/10"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 pb-4">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={(e) => { e.stopPropagation(); onAddSection(); }}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加练习段落
              </Button>
            </div>
          </div>
        )}

        {expanded && sections.length === 0 && (
          <div className="border-t border-gray-100 p-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={(e) => { e.stopPropagation(); onAddSection(); }}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加第一个练习段落
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
