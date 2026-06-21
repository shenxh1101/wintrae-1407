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
  let idCounter = 100;
  const nextId = () => ++idCounter;
  const today = new Date();
  const dateStr = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  let mockHomeworkList = [
    { id: 1, studentId: 1, pieceName: '献给爱丽丝', composer: '贝多芬', assignedDate: dateStr(-3), dueDate: dateStr(4), status: 'in_progress' as const, notes: '', createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, studentId: 2, pieceName: '月光奏鸣曲第三乐章', composer: '贝多芬', assignedDate: dateStr(-5), dueDate: dateStr(2), status: 'in_progress' as const, notes: '重点练习快速音阶段落', createdAt: '2026-01-01T00:00:00Z' },
    { id: 3, studentId: 4, pieceName: 'C大调小奏鸣曲', composer: '库劳', assignedDate: dateStr(-1), dueDate: dateStr(6), status: 'pending' as const, notes: '', createdAt: '2026-01-01T00:00:00Z' },
    { id: 4, studentId: 2, pieceName: '肖邦练习曲Op.10 No.3', composer: '肖邦', assignedDate: dateStr(-7), dueDate: dateStr(0), status: 'completed' as const, notes: '已完成，演奏效果好', createdAt: '2026-01-01T00:00:00Z' },
    { id: 5, studentId: 1, pieceName: '哈农练指法', composer: '哈农', assignedDate: dateStr(-2), dueDate: dateStr(5), status: 'in_progress' as const, notes: '每日必练', createdAt: '2026-01-01T00:00:00Z' },
  ];

  let mockSectionsList = [
    { id: 1, homeworkId: 1, sectionName: '主题呈示部', measures: '1-16小节', practiceNotes: '注意连音和断音的区别', status: 'passed' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, homeworkId: 1, sectionName: '中段', measures: '17-32小节', practiceNotes: '左手伴奏要轻', status: 'needs_review' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 3, homeworkId: 1, sectionName: '再现部', measures: '33-48小节', practiceNotes: '注意力度变化', status: 'pending' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 4, homeworkId: 2, sectionName: '引子', measures: '1-8小节', practiceNotes: '琶音要清晰', status: 'passed' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 5, homeworkId: 2, sectionName: '第一主题', measures: '9-32小节', practiceNotes: '注意快速音阶的准确性', status: 'needs_review' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 6, homeworkId: 3, sectionName: '第一乐章', measures: '1-40小节', practiceNotes: '保持稳定的节奏', status: 'pending' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 7, homeworkId: 4, sectionName: 'A段', measures: '1-16小节', practiceNotes: '注意右手旋律的歌唱性', status: 'passed' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 8, homeworkId: 4, sectionName: 'B段', measures: '17-32小节', practiceNotes: '左手琶音要流畅', status: 'passed' as const, createdAt: '2026-01-01T00:00:00Z' },
    { id: 9, homeworkId: 5, sectionName: '第1-5条', measures: '每条12遍', practiceNotes: '高抬指练习', status: 'passed' as const, createdAt: '2026-01-01T00:00:00Z' },
  ];

  let mockRecordingsList = [
    { id: 1, sectionId: 7, filePath: 'audio/recording_001.mp3', fileName: 'recording_001.mp3', fileSize: 2450000, duration: '2:35', uploadedDate: dateStr(-2), feedback: '演奏流畅，音乐性好！' },
    { id: 2, sectionId: 8, filePath: 'audio/recording_002.mp3', fileName: 'recording_002.mp3', fileSize: 3120000, duration: '3:12', uploadedDate: dateStr(-1), feedback: '左手琶音有些模糊，建议单独练习' },
    { id: 3, sectionId: 9, filePath: 'audio/recording_003.mp3', fileName: 'recording_003.mp3', fileSize: 1850000, duration: '1:58', uploadedDate: dateStr(-3), feedback: '手指力度有进步' },
  ];

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
    },
    {
      id: 2,
      name: '王小红',
      birthDate: '2012-08-22',
      level: '高级',
      preferredGenres: '古典',
      parentName: '王伟',
      parentPhone: '13900139002',
      parentEmail: 'wangwei@example.com',
      notes: '准备考级，需要加强练习曲目',
      createdAt: '2026-01-05T00:00:00Z'
    },
    {
      id: 3,
      name: '张小华',
      birthDate: '2017-01-10',
      level: '初级',
      preferredGenres: '流行',
      parentName: '张勇',
      parentPhone: '13700137003',
      parentEmail: 'zhangyong@example.com',
      notes: '初学，培养兴趣为主',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 4,
      name: '刘小美',
      birthDate: '2015-09-12',
      level: '中级',
      preferredGenres: '古典, 浪漫',
      parentName: '刘芳',
      parentPhone: '13600136004',
      parentEmail: 'liufang@example.com',
      notes: '学习认真，表现力好',
      createdAt: '2026-01-20T00:00:00Z'
    }
  ];

  const mockLessons = [
    {
      id: 1,
      studentId: 1,
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:00',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '练习哈农指法',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 2,
      studentId: 1,
      dayOfWeek: 2,
      startTime: '16:00',
      endTime: '17:00',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 3,
      studentId: 2,
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '11:00',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '贝多芬奏鸣曲练习',
      createdAt: '2026-01-05T00:00:00Z'
    },
    {
      id: 4,
      studentId: 2,
      dayOfWeek: 3,
      startTime: '14:00',
      endTime: '15:30',
      type: 'makeup' as const,
      status: 'scheduled' as const,
      notes: '上周请假补课',
      createdAt: '2026-01-10T00:00:00Z'
    },
    {
      id: 5,
      studentId: 2,
      dayOfWeek: 5,
      startTime: '15:00',
      endTime: '16:00',
      type: 'leave' as const,
      status: 'cancelled' as const,
      notes: '学生外出旅游请假',
      createdAt: '2026-06-15T00:00:00Z'
    },
    {
      id: 6,
      studentId: 3,
      dayOfWeek: 1,
      startTime: '16:00',
      endTime: '16:45',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '幼儿启蒙课',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 7,
      studentId: 3,
      dayOfWeek: 4,
      startTime: '17:00',
      endTime: '17:45',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 8,
      studentId: 1,
      dayOfWeek: 5,
      startTime: '10:00',
      endTime: '11:00',
      type: 'makeup' as const,
      status: 'scheduled' as const,
      notes: '比赛前加练',
      createdAt: '2026-06-18T00:00:00Z'
    },
    {
      id: 9,
      studentId: 3,
      dayOfWeek: 6,
      startTime: '09:00',
      endTime: '09:45',
      type: 'regular' as const,
      status: 'scheduled' as const,
      notes: '',
      createdAt: '2026-02-01T00:00:00Z'
    }
  ];

  const mockBillingRecords = [
    {
      id: 1,
      studentId: 1,
      date: '2026-06-01',
      type: 'lesson' as const,
      amount: 800,
      description: '6月课时费（4节课）',
      isPaid: true,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-06-01T10:00:00Z'
    },
    {
      id: 2,
      studentId: 1,
      date: '2026-05-02',
      type: 'lesson' as const,
      amount: 800,
      description: '5月课时费（4节课）',
      isPaid: true,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-05-02T10:00:00Z'
    },
    {
      id: 3,
      studentId: 2,
      date: '2026-06-05',
      type: 'lesson' as const,
      amount: 900,
      description: '6月课时费（4节课，含考级辅导）',
      isPaid: false,
      lessonHours: 4,
      notes: '家长说下周转账',
      createdAt: '2026-06-05T10:00:00Z'
    },
    {
      id: 4,
      studentId: 2,
      date: '2026-06-10',
      type: 'material' as const,
      amount: 150,
      description: '考级教材《贝多芬奏鸣曲集》',
      isPaid: true,
      materialName: '贝多芬奏鸣曲集',
      notes: '',
      createdAt: '2026-06-10T10:00:00Z'
    },
    {
      id: 5,
      studentId: 3,
      date: '2026-06-01',
      type: 'lesson' as const,
      amount: 480,
      description: '6月课时费（4节课，幼儿启蒙）',
      isPaid: false,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-06-01T10:00:00Z'
    },
    {
      id: 6,
      studentId: 3,
      date: '2026-06-12',
      type: 'material' as const,
      amount: 65,
      description: '儿童钢琴入门教材',
      isPaid: false,
      materialName: '儿童钢琴入门',
      notes: '',
      createdAt: '2026-06-12T10:00:00Z'
    },
    {
      id: 7,
      studentId: 4,
      date: '2026-06-01',
      type: 'lesson' as const,
      amount: 800,
      description: '6月课时费（4节课）',
      isPaid: true,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-06-01T10:00:00Z'
    },
    {
      id: 8,
      studentId: 4,
      date: '2026-06-15',
      type: 'other' as const,
      amount: 200,
      description: '音乐厅表演报名费',
      isPaid: false,
      notes: '',
      createdAt: '2026-06-15T10:00:00Z'
    },
    {
      id: 9,
      studentId: 1,
      date: '2026-04-03',
      type: 'lesson' as const,
      amount: 800,
      description: '4月课时费（4节课）',
      isPaid: true,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-04-03T10:00:00Z'
    },
    {
      id: 10,
      studentId: 2,
      date: '2026-05-08',
      type: 'lesson' as const,
      amount: 900,
      description: '5月课时费（4节课，含考级辅导）',
      isPaid: true,
      lessonHours: 4,
      notes: '',
      createdAt: '2026-05-08T10:00:00Z'
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
      getByStudent: (studentId: number) => Promise.resolve({ success: true, data: mockLessons.filter(l => l.studentId === studentId) }),
      create: (data: any) => {
        const newLesson = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        mockLessons.push(newLesson);
        return Promise.resolve({ success: true, data: newLesson });
      },
      update: (id: number, data: any) => {
        const idx = mockLessons.findIndex(l => l.id === id);
        if (idx !== -1) {
          mockLessons[idx] = { ...mockLessons[idx], ...data };
        }
        return Promise.resolve({ success: true });
      },
      delete: (id: number) => {
        const idx = mockLessons.findIndex(l => l.id === id);
        if (idx !== -1) {
          mockLessons.splice(idx, 1);
        }
        return Promise.resolve({ success: true });
      },
      move: (id: number, dayOfWeek: number, startTime: string, endTime: string) => {
        const idx = mockLessons.findIndex(l => l.id === id);
        if (idx !== -1) {
          mockLessons[idx] = { ...mockLessons[idx], dayOfWeek, startTime, endTime };
        }
        return Promise.resolve({ success: true });
      },
    },
    records: {
      getAll: () => Promise.resolve({ success: true, data: [] }),
      getById: (id: number) => Promise.resolve({ success: true, data: undefined }),
      create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: Date.now(), createdAt: new Date().toISOString() } }),
      update: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
    },
    homework: {
      getAll: (studentId?: number) => {
        let list = mockHomeworkList;
        if (studentId) list = list.filter(h => h.studentId === studentId);
        return Promise.resolve({ success: true, data: [...list].sort((a, b) => b.assignedDate.localeCompare(a.assignedDate)) });
      },
      getById: (id: number) => Promise.resolve({ success: true, data: mockHomeworkList.find(h => h.id === id) }),
      getSections: (homeworkId: number) => Promise.resolve({ success: true, data: mockSectionsList.filter(s => s.homeworkId === homeworkId) }),
      getRecordings: (sectionId: number) => Promise.resolve({ success: true, data: mockRecordingsList.filter(r => r.sectionId === sectionId) }),
      createHomework: (data: any) => { const h = { ...data, id: nextId(), createdAt: new Date().toISOString() }; mockHomeworkList.push(h); return Promise.resolve({ success: true, data: h }); },
      updateHomework: (id: number, data: any) => { const idx = mockHomeworkList.findIndex(h => h.id === id); if (idx >= 0) mockHomeworkList[idx] = { ...mockHomeworkList[idx], ...data }; return Promise.resolve({ success: true }); },
      deleteHomework: (id: number) => {
        const idx = mockHomeworkList.findIndex(h => h.id === id);
        if (idx >= 0) {
          mockHomeworkList.splice(idx, 1);
          const sectionIds = mockSectionsList.filter(s => s.homeworkId === id).map(s => s.id);
          mockSectionsList = mockSectionsList.filter(s => s.homeworkId !== id);
          mockRecordingsList = mockRecordingsList.filter(r => !sectionIds.includes(r.sectionId));
        }
        return Promise.resolve({ success: true });
      },
      createSection: (data: any) => { const s = { ...data, id: nextId(), createdAt: new Date().toISOString() }; mockSectionsList.push(s); return Promise.resolve({ success: true, data: s }); },
      updateSection: (id: number, data: any) => { const idx = mockSectionsList.findIndex(s => s.id === id); if (idx >= 0) mockSectionsList[idx] = { ...mockSectionsList[idx], ...data }; return Promise.resolve({ success: true }); },
      updateSectionStatus: (id: number, status: any) => { const idx = mockSectionsList.findIndex(s => s.id === id); if (idx >= 0) mockSectionsList[idx] = { ...mockSectionsList[idx], status }; return Promise.resolve({ success: true }); },
      deleteSection: (id: number) => {
        const idx = mockSectionsList.findIndex(s => s.id === id);
        if (idx >= 0) {
          mockSectionsList.splice(idx, 1);
          mockRecordingsList = mockRecordingsList.filter(r => r.sectionId !== id);
        }
        return Promise.resolve({ success: true });
      },
      createRecording: (data: any) => { const r = { ...data, id: nextId() }; mockRecordingsList.push(r); return Promise.resolve({ success: true, data: r }); },
      updateRecording: (id: number, data: any) => { const idx = mockRecordingsList.findIndex(r => r.id === id); if (idx >= 0) mockRecordingsList[idx] = { ...mockRecordingsList[idx], ...data }; return Promise.resolve({ success: true }); },
      deleteRecording: (id: number) => { const idx = mockRecordingsList.findIndex(r => r.id === id); if (idx >= 0) mockRecordingsList.splice(idx, 1); return Promise.resolve({ success: true }); },
    },
    billing: {
      getAll: (studentId?: number) => {
        let data = [...mockBillingRecords];
        if (studentId) {
          data = data.filter(r => r.studentId === studentId);
        }
        data.sort((a, b) => b.date.localeCompare(a.date));
        return Promise.resolve({ success: true, data });
      },
      getById: (id: number) => Promise.resolve({ success: true, data: mockBillingRecords.find(r => r.id === id) }),
      getMonthlyStats: () => {
        const monthMap = new Map<string, { count: number; totalAmount: number; unpaidAmount: number }>();
        mockBillingRecords.forEach(r => {
          const month = r.date.slice(0, 7);
          if (!monthMap.has(month)) {
            monthMap.set(month, { count: 0, totalAmount: 0, unpaidAmount: 0 });
          }
          const stat = monthMap.get(month)!;
          stat.count += 1;
          stat.totalAmount += r.amount;
          if (!r.isPaid) {
            stat.unpaidAmount += r.amount;
          }
        });
        const stats = Array.from(monthMap.entries())
          .map(([month, s]) => ({ month, ...s }))
          .sort((a, b) => b.month.localeCompare(a.month));
        return Promise.resolve({ success: true, data: stats });
      },
      getSummary: () => {
        const totalAmount = mockBillingRecords.reduce((sum, r) => sum + r.amount, 0);
        const unpaidAmount = mockBillingRecords.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0);
        const unpaidStudentIds = new Set(mockBillingRecords.filter(r => !r.isPaid).map(r => r.studentId));
        const unpaidStudents = unpaidStudentIds.size;
        return Promise.resolve({ success: true, data: { totalAmount, unpaidAmount, unpaidStudents } });
      },
      create: (data: any) => {
        const newRecord = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        mockBillingRecords.push(newRecord);
        return Promise.resolve({ success: true, data: newRecord });
      },
      update: (id: number, data: any) => {
        const idx = mockBillingRecords.findIndex(r => r.id === id);
        if (idx !== -1) {
          mockBillingRecords[idx] = { ...mockBillingRecords[idx], ...data };
        }
        return Promise.resolve({ success: true });
      },
      delete: (id: number) => {
        const idx = mockBillingRecords.findIndex(r => r.id === id);
        if (idx !== -1) {
          mockBillingRecords.splice(idx, 1);
        }
        return Promise.resolve({ success: true });
      },
      togglePaid: (id: number) => {
        const idx = mockBillingRecords.findIndex(r => r.id === id);
        if (idx !== -1) {
          mockBillingRecords[idx].isPaid = !mockBillingRecords[idx].isPaid;
        }
        return Promise.resolve({ success: true });
      },
    },
    files: {
      saveAudio: () => Promise.resolve({ success: true, data: 'mock/path/audio.mp3' }),
      selectAudio: () => Promise.resolve({ success: true, data: 'mock/path/file.mp3' }),
      savePdf: () => Promise.resolve({ success: true, data: 'mock/path/report.pdf' }),
    }
  };
}
