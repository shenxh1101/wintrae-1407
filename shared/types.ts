export interface Student {
  id: number;
  name: string;
  birthDate?: string;
  level?: string;
  preferredGenres?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  notes?: string;
  createdAt: string;
}

export type LessonType = 'regular' | 'makeup' | 'leave';
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Lesson {
  id: number;
  studentId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: LessonType;
  status: LessonStatus;
  notes?: string;
  createdAt: string;
}

export interface LessonRecord {
  id: number;
  studentId: number;
  lessonId?: number;
  date: string;
  keyPoints?: string;
  demonstrationAudio?: string;
  nextGoals?: string;
  notes?: string;
  createdAt: string;
}

export type HomeworkStatus = 'pending' | 'in_progress' | 'completed' | 'paused';
export type SectionStatus = 'pending' | 'passed' | 'needs_review' | 'paused';

export interface Homework {
  id: number;
  studentId: number;
  pieceName: string;
  composer?: string;
  assignedDate: string;
  dueDate?: string;
  status: HomeworkStatus;
  notes?: string;
  createdAt: string;
}

export interface PracticeSection {
  id: number;
  homeworkId: number;
  sectionName: string;
  measures?: string;
  practiceNotes?: string;
  status: SectionStatus;
  createdAt: string;
}

export interface Recording {
  id: number;
  sectionId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  duration?: string;
  uploadedDate: string;
  feedback?: string;
}

export type BillingType = 'lesson' | 'material' | 'other';

export interface BillingRecord {
  id: number;
  studentId: number;
  date: string;
  type: BillingType;
  amount: number;
  description: string;
  isPaid: boolean;
  lessonHours?: number;
  materialName?: string;
  notes?: string;
  createdAt: string;
}

export interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MonthlyStats {
  month: string;
  count: number;
  totalAmount: number;
  unpaidAmount: number;
}

export interface BillingSummary {
  totalAmount: number;
  unpaidAmount: number;
  unpaidStudents: number;
}

export interface StudentStats {
  totalLessons: number;
  completedHomework: number;
  pendingHomework: number;
  totalAmount: number;
  unpaidAmount: number;
}

export type WindowApi = {
  students: {
    getAll: () => Promise<IpcResponse<Student[]>>;
    getById: (id: number) => Promise<IpcResponse<Student | undefined>>;
    getStats: (id: number) => Promise<IpcResponse<StudentStats>>;
    create: (data: Omit<Student, 'id' | 'createdAt'>) => Promise<IpcResponse<Student>>;
    update: (id: number, data: Partial<Omit<Student, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    delete: (id: number) => Promise<IpcResponse<void>>;
  };
  lessons: {
    getAll: () => Promise<IpcResponse<Lesson[]>>;
    getByStudent: (studentId: number) => Promise<IpcResponse<Lesson[]>>;
    create: (data: Omit<Lesson, 'id' | 'createdAt'>) => Promise<IpcResponse<Lesson>>;
    update: (id: number, data: Partial<Omit<Lesson, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    delete: (id: number) => Promise<IpcResponse<void>>;
    move: (id: number, dayOfWeek: number, startTime: string, endTime: string) => Promise<IpcResponse<void>>;
  };
  records: {
    getAll: (studentId?: number) => Promise<IpcResponse<LessonRecord[]>>;
    getById: (id: number) => Promise<IpcResponse<LessonRecord | undefined>>;
    create: (data: Omit<LessonRecord, 'id' | 'createdAt'>) => Promise<IpcResponse<LessonRecord>>;
    update: (id: number, data: Partial<Omit<LessonRecord, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    delete: (id: number) => Promise<IpcResponse<void>>;
  };
  homework: {
    getAll: (studentId?: number) => Promise<IpcResponse<Homework[]>>;
    getSections: (homeworkId: number) => Promise<IpcResponse<PracticeSection[]>>;
    getRecordings: (sectionId: number) => Promise<IpcResponse<Recording[]>>;
    createHomework: (data: Omit<Homework, 'id' | 'createdAt'>) => Promise<IpcResponse<Homework>>;
    updateHomework: (id: number, data: Partial<Omit<Homework, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    deleteHomework: (id: number) => Promise<IpcResponse<void>>;
    createSection: (data: Omit<PracticeSection, 'id' | 'createdAt'>) => Promise<IpcResponse<PracticeSection>>;
    updateSection: (id: number, data: Partial<Omit<PracticeSection, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    deleteSection: (id: number) => Promise<IpcResponse<void>>;
    updateSectionStatus: (id: number, status: SectionStatus) => Promise<IpcResponse<void>>;
    createRecording: (data: Omit<Recording, 'id'>) => Promise<IpcResponse<Recording>>;
    updateRecording: (id: number, data: Partial<Omit<Recording, 'id' | 'sectionId'>>) => Promise<IpcResponse<void>>;
    deleteRecording: (id: number) => Promise<IpcResponse<void>>;
  };
  billing: {
    getAll: (studentId?: number) => Promise<IpcResponse<BillingRecord[]>>;
    getMonthlyStats: () => Promise<IpcResponse<MonthlyStats[]>>;
    getSummary: () => Promise<IpcResponse<BillingSummary>>;
    create: (data: Omit<BillingRecord, 'id' | 'createdAt'>) => Promise<IpcResponse<BillingRecord>>;
    update: (id: number, data: Partial<Omit<BillingRecord, 'id' | 'createdAt'>>) => Promise<IpcResponse<void>>;
    delete: (id: number) => Promise<IpcResponse<void>>;
    togglePaid: (id: number) => Promise<IpcResponse<void>>;
  };
  files: {
    selectAudio: () => Promise<IpcResponse<string>>;
    saveAudio: (fileName: string, arrayBuffer: ArrayBuffer) => Promise<IpcResponse<string>>;
    savePdf: (fileName: string, arrayBuffer: ArrayBuffer) => Promise<IpcResponse<string>>;
  };
};

declare global {
  interface Window {
    api: WindowApi;
  }
}
