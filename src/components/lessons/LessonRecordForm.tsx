import { useState, useEffect, useRef } from 'react';
import { Upload, Play, Pause, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { handleIpcResponse, getApi } from '@/utils/ipc';
import type { LessonRecord, Student } from '@/types';

interface LessonRecordFormProps {
  record?: LessonRecord | null;
  students: Student[];
  defaultStudentId?: number;
  defaultDate?: string;
  onSubmit: (data: Omit<LessonRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const LessonRecordForm = ({ record, students, defaultStudentId, defaultDate, onSubmit, onCancel }: LessonRecordFormProps) => {
  const [formData, setFormData] = useState({
    studentId: defaultStudentId || 0,
    date: defaultDate || '',
    keyPoints: '',
    demonstrationAudio: undefined as string | undefined,
    nextGoals: '',
    notes: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        studentId: record.studentId,
        date: record.date,
        keyPoints: record.keyPoints || '',
        demonstrationAudio: record.demonstrationAudio || undefined,
        nextGoals: record.nextGoals || '',
        notes: record.notes || '',
      });
    }
  }, [record]);

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async () => {
    try {
      const api = getApi();
      const filePath = await handleIpcResponse(await api.files.selectAudio());
      if (filePath) {
        setFormData(prev => ({ ...prev, demonstrationAudio: filePath }));
      }
    } catch (error) {
      console.error('选择音频文件失败:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const api = getApi();
          const fileName = `audio_${Date.now()}.mp3`;
          const filePath = await handleIpcResponse(await api.files.saveAudio(fileName, arrayBuffer));
          setFormData(prev => ({ ...prev, demonstrationAudio: filePath }));
        } catch (error) {
          console.error('保存音频失败:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const clearAudio = () => {
    setFormData(prev => ({ ...prev, demonstrationAudio: undefined }));
    setAudioFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.date) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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

      <div>
        <label className="label-text block mb-2">示范音频</label>
        {formData.demonstrationAudio ? (
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
            <button
              type="button"
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {formData.demonstrationAudio.split('/').pop() || '示范音频'}
              </p>
              <p className="text-xs text-gray-500">已上传</p>
            </div>
            <button
              type="button"
              onClick={clearAudio}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleFileSelect}
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">选择文件</span>
              <span className="text-xs text-gray-500">MP3, WAV, M4A</span>
            </button>
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer">
              <Mic className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">上传录音</span>
              <span className="text-xs text-gray-500">点击选择文件</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}
        {formData.demonstrationAudio && (
          <audio
            ref={audioRef}
            src={`file://${formData.demonstrationAudio}`}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>

      <Textarea
        label="重点问题"
        value={formData.keyPoints}
        onChange={(e) => handleChange('keyPoints', e.target.value)}
        placeholder="记录本节课发现的重点问题、需要改进的地方..."
        rows={4}
      />

      <Textarea
        label="下次目标"
        value={formData.nextGoals}
        onChange={(e) => handleChange('nextGoals', e.target.value)}
        placeholder="设定下节课的学习目标、练习要求..."
        rows={4}
      />

      <Textarea
        label="备注"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="其他需要记录的信息..."
        rows={2}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {record ? '保存修改' : '添加记录'}
        </Button>
      </div>
    </form>
  );
};
