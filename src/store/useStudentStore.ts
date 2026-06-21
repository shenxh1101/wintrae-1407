import { create } from 'zustand';
import type { Student, StudentStats } from '@/types';
import { getApi, handleIpcResponse } from '@/utils/ipc';

interface StudentStore {
  students: Student[];
  selectedStudentId: number | null;
  loading: boolean;
  error: string | null;
  studentStats: Record<number, StudentStats>;
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<Student | undefined>;
  fetchStats: (id: number) => Promise<void>;
  create: (data: Omit<Student, 'id' | 'createdAt'>) => Promise<Student>;
  update: (id: number, data: Partial<Omit<Student, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setSelected: (id: number | null) => void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  students: [],
  selectedStudentId: null,
  loading: false,
  error: null,
  studentStats: {},

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const students = await handleIpcResponse(await api.students.getAll());
      set({ students, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const student = await handleIpcResponse(await api.students.getById(id));
      if (student) {
        set(state => ({
          students: state.students.map(s => s.id === id ? student : s),
          loading: false
        }));
      }
      return student;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchStats: async (id: number) => {
    try {
      const api = getApi();
      const stats = await handleIpcResponse(await api.students.getStats(id));
      set(state => ({
        studentStats: { ...state.studentStats, [id]: stats }
      }));
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const student = await handleIpcResponse(await api.students.create(data));
      set(state => ({
        students: [...state.students, student].sort((a, b) => a.name.localeCompare(b.name)),
        loading: false
      }));
      return student;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.students.update(id, data));
      set(state => ({
        students: state.students.map(s => s.id === id ? { ...s, ...data } : s),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.students.delete(id));
      set(state => ({
        students: state.students.filter(s => s.id !== id),
        selectedStudentId: state.selectedStudentId === id ? null : state.selectedStudentId,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setSelected: (id) => {
    set({ selectedStudentId: id });
  }
}));
