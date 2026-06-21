import { useEffect, useState, useMemo } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs } from '@/components/ui/Tabs';
import { Music, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { HomeworkCard } from '@/components/homework/HomeworkCard';
import { HomeworkForm } from '@/components/homework/HomeworkForm';
import { SectionForm } from '@/components/homework/SectionForm';
import { useHomeworkStore } from '@/store/useHomeworkStore';
import { useStudentStore } from '@/store/useStudentStore';
import type { Homework as HomeworkType, PracticeSection, Recording } from '@/types';
import { handleIpcResponse, getApi } from '@/utils/ipc';

export const Homework = () => {
  const { homeworkList, sections, recordings, loading, fetchAll, createHomework, updateHomework, removeHomework, createSection, updateSection, removeSection, createRecording, updateSectionStatus } = useHomeworkStore();
  const { students, fetchAll: fetchStudents } = useStudentStore();
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkType | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<PracticeSection | null>(null);
  const [currentHomeworkId, setCurrentHomeworkId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingHomework, setDeletingHomework] = useState<HomeworkType | null>(null);
  const [deletingSection, setDeletingSection] = useState<number | null>(null);
  const [showRecordingUpload, setShowRecordingUpload] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const studentId = studentFilter ? parseInt(studentFilter) : undefined;
    fetchAll(studentId);
  }, [fetchAll, studentFilter]);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    students.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [students]);

  const filteredHomework = useMemo(() => {
    return homeworkList.filter(hw => {
      const matchStudent = !studentFilter || hw.studentId.toString() === studentFilter;
      const matchStatus = !statusFilter || hw.status === statusFilter;
      return matchStudent && matchStatus;
    }).sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
  }, [homeworkList, studentFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = homeworkList.length;
    const inProgress = homeworkList.filter(hw => hw.status === 'in_progress').length;
    const completed = homeworkList.filter(hw => hw.status === 'completed').length;
    const pendingReview = Object.values(sections).flat().filter(s => s.status === 'needs_review').length;
    return { total, inProgress, completed, pendingReview };
  }, [homeworkList, sections]);

  const handleAddHomework = () => {
    setEditingHomework(null);
    setShowHomeworkForm(true);
  };

  const handleEditHomework = (homework: HomeworkType) => {
    setEditingHomework(homework);
    setShowHomeworkForm(true);
  };

  const handleDeleteHomeworkClick = (homework: HomeworkType) => {
    setDeletingHomework(homework);
    setShowDeleteConfirm(true);
  };

  const handleDeleteHomework = async () => {
    if (deletingHomework) {
      await removeHomework(deletingHomework.id);
      setShowDeleteConfirm(false);
      setDeletingHomework(null);
    }
  };

  const handleAddSection = (homeworkId: number) => {
    setCurrentHomeworkId(homeworkId);
    setEditingSection(null);
    setShowSectionForm(true);
  };

  const handleEditSection = (section: PracticeSection) => {
    setCurrentHomeworkId(section.homeworkId);
    setEditingSection(section);
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (confirm('确定要删除这个练习段落吗？')) {
      await removeSection(sectionId);
    }
  };

  const handleUploadRecording = (sectionId: number) => {
    setUploadingSectionId(sectionId);
    setSelectedFile(null);
    setShowRecordingUpload(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSystemFileSelect = async () => {
    try {
      const api = getApi();
      const filePath = await handleIpcResponse(await api.files.selectAudio());
      if (filePath && uploadingSectionId) {
        await createRecording({
          sectionId: uploadingSectionId,
          filePath,
          fileName: filePath.split('/').pop() || 'recording.mp3',
          fileSize: 0,
          duration: '',
          uploadedDate: new Date().toISOString().slice(0, 10),
          feedback: '',
        });
        setShowRecordingUpload(false);
        setUploadingSectionId(null);
        alert('录音上传成功！');
      }
    } catch (error) {
      console.error('选择音频文件失败:', error);
    }
  };

  const handleSaveRecording = async () => {
    if (!selectedFile || !uploadingSectionId) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const api = getApi();
          const fileName = `recording_${Date.now()}_${selectedFile.name}`;
          const filePath = await handleIpcResponse(await api.files.saveAudio(fileName, arrayBuffer));
          
          await createRecording({
            sectionId: uploadingSectionId,
            filePath,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            duration: '',
            uploadedDate: new Date().toISOString().slice(0, 10),
            feedback: '',
          });
          
          setShowRecordingUpload(false);
          setUploadingSectionId(null);
          setSelectedFile(null);
          alert('录音上传成功！');
        } catch (error) {
          console.error('保存录音失败:', error);
          alert('上传失败，请重试');
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('读取文件失败:', error);
    }
  };

  const handleHomeworkSubmit = async (data: Omit<HomeworkType, 'id' | 'createdAt'>) => {
    if (editingHomework) {
      await updateHomework(Number(editingHomework.id), data);
    } else {
      await createHomework(data);
    }
    setShowHomeworkForm(false);
    setEditingHomework(null);
  };

  const handleSectionSubmit = async (data: Omit<PracticeSection, 'id' | 'createdAt'>) => {
    if (editingSection) {
      await updateSection(Number(editingSection.id), data);
    } else {
      await createSection(data);
    }
    setShowSectionForm(false);
    setEditingSection(null);
    setCurrentHomeworkId(null);
  };

  const handleUpdateStatus = async (sectionId: number, status: 'passed' | 'needs_review' | 'paused') => {
    await updateSectionStatus(Number(sectionId), status);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title mb-0">作业追踪</h2>
        <Button onClick={handleAddHomework}>
          <Plus className="w-4 h-4" />
          添加作业
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总作业数"
          value={stats.total}
          icon={<Music className="w-5 h-5" />}
        />
        <StatCard
          title="进行中"
          value={stats.inProgress}
          icon={<Clock className="w-5 h-5" />}
          valueColor="text-primary-600"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          icon={<CheckCircle className="w-5 h-5" />}
          valueColor="text-accent-mint"
        />
        <StatCard
          title="待审核"
          value={stats.pendingReview}
          icon={<AlertCircle className="w-5 h-5" />}
          valueColor="text-accent-gold"
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-48">
          <Select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            options={[
              { value: '', label: '全部学生' },
              ...students.map(s => ({ value: s.id.toString(), label: s.name })),
            ]}
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: '全部状态' },
              { value: 'pending', label: '待开始' },
              { value: 'in_progress', label: '进行中' },
              { value: 'completed', label: '已完成' },
              { value: 'paused', label: '已暂停' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">加载中...</div>
        </div>
      ) : filteredHomework.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">暂无作业数据</p>
          <Button onClick={handleAddHomework}>添加第一份作业</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-4">
          {filteredHomework.map(homework => (
            <HomeworkCard
              key={homework.id}
              homework={homework}
              sections={sections[homework.id] || []}
              recordings={Object.values(recordings).flat().filter(r => {
                const sectionIds = (sections[homework.id] || []).map(s => s.id);
                return sectionIds.includes(r.sectionId);
              })}
              studentName={studentMap[homework.studentId]}
              onEdit={() => handleEditHomework(homework)}
              onDelete={() => handleDeleteHomeworkClick(homework)}
              onAddSection={() => handleAddSection(Number(homework.id))}
              onEditSection={handleEditSection}
              onDeleteSection={handleDeleteSection}
              onUploadRecording={handleUploadRecording}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showHomeworkForm}
        onClose={() => { setShowHomeworkForm(false); setEditingHomework(null); }}
        title={editingHomework ? '编辑作业' : '添加作业'}
        size="lg"
      >
        <HomeworkForm
          homework={editingHomework}
          students={students}
          defaultStudentId={studentFilter ? parseInt(studentFilter) : undefined}
          onSubmit={handleHomeworkSubmit}
          onCancel={() => { setShowHomeworkForm(false); setEditingHomework(null); }}
        />
      </Modal>

      <Modal
        isOpen={showSectionForm}
        onClose={() => { setShowSectionForm(false); setEditingSection(null); setCurrentHomeworkId(null); }}
        title={editingSection ? '编辑练习段落' : '添加练习段落'}
        size="lg"
      >
        {currentHomeworkId && (
          <SectionForm
            section={editingSection}
            homeworkId={currentHomeworkId}
            onSubmit={handleSectionSubmit}
            onCancel={() => { setShowSectionForm(false); setEditingSection(null); setCurrentHomeworkId(null); }}
          />
        )}
      </Modal>

      <Modal
        isOpen={showRecordingUpload}
        onClose={() => { setShowRecordingUpload(false); setUploadingSectionId(null); setSelectedFile(null); }}
        title="上传学生录音"
        size="md"
      >
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={handleSystemFileSelect}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">系统文件</span>
              <span className="text-xs text-gray-500 text-center">从电脑选择<br />MP3, WAV, M4A</span>
            </button>
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">直接上传</span>
              <span className="text-xs text-gray-500 text-center">点击选择文件<br />或拖拽上传</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowRecordingUpload(false); setUploadingSectionId(null); setSelectedFile(null); }}>
              取消
            </Button>
            <Button onClick={handleSaveRecording} disabled={!selectedFile}>
              保存录音
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingHomework(null); }}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            确定要删除作业《{deletingHomework?.pieceName}》吗？此操作将同时删除所有相关的练习段落和录音，且无法恢复。
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletingHomework(null); }}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDeleteHomework}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
