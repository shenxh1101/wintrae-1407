import type { IpcResponse } from '@/types';

export function isElectron(): boolean {
  return window && typeof window.api !== 'undefined';
}

export async function handleIpcResponse<T>(response: IpcResponse<T>): Promise<T> {
  if (!response.success) {
    throw new Error(response.error || '操作失败');
  }
  return response.data as T;
}

export function getApi() {
  if (!isElectron()) {
    console.warn('未在 Electron 环境中运行，使用 mock 数据');
    return getMockApi();
  }
  return window.api;
}

function getMockApi() {
  const mockStudents = [
    {
      id: 1,
      name: '李小明',
      birthDate: '2015-03-15',
      level: '中级',
      preferredGenres: '古典, 浪漫',
      parentName: '李华',
      parentPhone: '13800138001',
      parentEmail: 'lihua@example.com',
      notes: '学习钢琴3年，手指力度需要加强',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  const mockLessons = [
    {
      id: 1,
      studentId: 1,
      dayOfWeek: 1,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  return {
    students: {
      getAll: () => Promise.resolve({ success: true, data: mockStudents }),
      getById: (id: number) => Promise.resolve({ success: true, data: mockStudents.find(s => s.id === id) }),
      create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      update: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
      getStats: () => Promise.resolve({
        success: true,
        data: { totalLessons: 10, completedHomework: 15, pendingHomework: 3, totalAmount: 8000, unpaidAmount: 800 }
      })
    },
    lessons: {
      getAll: () => Promise.resolve({ success: true, data: mockLessons }),
      getById: (id: number) => Promise.resolve({ success: true, data: mockLessons.find(l => l.id === id) }),
      getByStudent: () => Promise.resolve({ success: true, data: mockLessons }),
      create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      update: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
      move: () => Promise.resolve({ success: true }),
    },
    records: {
      getAll: () => Promise.resolve({ success: true, data: [] }),
      getById: (id: number) => Promise.resolve({ success: true, data: undefined }),
      create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      update: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
    },
    homework: {
      getAll: () => Promise.resolve({ success: true, data: [] }),
      getById: (id: number) => Promise.resolve({ success: true, data: undefined }),
      getSections: () => Promise.resolve({ success: true, data: [] }),
      getRecordings: () => Promise.resolve({ success: true, data: [] }),
      createHomework: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      updateHomework: () => Promise.resolve({ success: true }),
      deleteHomework: () => Promise.resolve({ success: true }),
      createSection: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      updateSection: () => Promise.resolve({ success: true }),
      updateSectionStatus: () => Promise.resolve({ success: true }),
      deleteSection: () => Promise.resolve({ success: true }),
      createRecording: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now() } }),
      updateRecording: () => Promise.resolve({ success: true }),
      deleteRecording: () => Promise.resolve({ success: true }),
    },
    billing: {
      getAll: () => Promise.resolve({ success: true, data: [] }),
      getById: (id: number) => Promise.resolve({ success: true, data: undefined }),
      getMonthlyStats: () => Promise.resolve({ success: true, data: [] }),
      getSummary: () => Promise.resolve({ success: true, data: { totalAmount: 4685, unpaidAmount: 2180, unpaidStudents: 3 } }),
      create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      update: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
      togglePaid: () => Promise.resolve({ success: true }),
    },
    files: {
      saveAudio: () => Promise.resolve({ success: true, data: 'mock/path/audio.mp3' }),
      selectAudio: () => Promise.resolve({ success: true, data: 'mock/path/file.mp3' }),
      savePdf: () => Promise.resolve({ success: true, data: 'mock/path/report.pdf' }),
    }
  };
}
