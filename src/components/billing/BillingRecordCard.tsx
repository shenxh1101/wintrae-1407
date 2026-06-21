import { Edit2, Trash2, Download, Check, Clock, DollarSign, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { BillingRecord } from '@/types';
import { formatDate } from '@/utils/date';

interface BillingRecordCardProps {
  record: BillingRecord;
  studentName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
  onExportReport: () => void;
  isExporting?: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lesson: { icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50' },
  material: { icon: DollarSign, color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
  other: { icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export const BillingRecordCard = ({
  record,
  studentName,
  onEdit,
  onDelete,
  onTogglePaid,
  onExportReport,
  isExporting = false,
}: BillingRecordCardProps) => {
  const config = typeConfig[record.type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <Card className="group overflow-hidden">
      <Card.Body className="p-0">
        <div className={`h-1 ${record.isPaid ? 'bg-accent-mint' : 'bg-accent-gold'}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 font-serif">{record.description}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{formatDate(record.date)}</span>
                  {studentName && <span>· {studentName}</span>}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold font-serif text-gray-900">
                ¥{record.amount.toFixed(2)}
              </p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <Badge variant={record.isPaid ? 'success' : 'warning'}>
                  {record.isPaid ? '已支付' : '未支付'}
                </Badge>
              </div>
            </div>
          </div>

          {record.notes && (
            <p className="text-sm text-gray-500 mt-3 line-clamp-2">{record.notes}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {record.type === 'lesson' && record.lessonHours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {record.lessonHours} 课时
                </span>
              )}
              {record.type === 'material' && record.materialName && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {record.materialName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!record.isPaid && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePaid}
                  className="text-accent-mint hover:text-accent-mint hover:bg-accent-mint/10"
                  title="标记为已支付"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportReport}
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                title="导出学习报告"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
