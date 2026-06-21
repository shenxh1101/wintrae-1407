import { create } from 'zustand';
import type { Lesson } from '@/types';
import { getApi, handleIpcResponse } from '@/utils/ipc';

interface ScheduleStore {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchWeek: () => Promise<void>;
  fetchByStudent: (studentId: number) => Promise<void>;
  create: (data: Omit<Lesson, 'id' | 'createdAt'>) => Promise<Lesson>;
  update: (id: number, data: Partial<Omit<Lesson, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  moveLesson: (id: number, dayOfWeek: number, newStartTime: string, newEndTime: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  lessons: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const lessons = await handleIpcResponse(await api.lessons.getAll());
      set({ lessons, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchWeek: async () => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const lessons = await handleIpcResponse(await api.lessons.getAll());
      set({ lessons, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchByStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const lessons = await handleIpcResponse(await api.lessons.getByStudent(studentId));
      set({ lessons, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const lesson = await handleIpcResponse(await api.lessons.create(data));
      set(state => ({
        lessons: [...state.lessons, lesson].sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
          return a.startTime.localeCompare(b.startTime);
        }),
        loading: false
      }));
      return lesson;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.lessons.update(id, data));
      set(state => ({
        lessons: state.lessons.map(l => l.id === id ? { ...l, ...data } : l),
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
      await handleIpcResponse(await api.lessons.delete(id));
      set(state => ({
        lessons: state.lessons.filter(l => l.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  moveLesson: async (id, dayOfWeek, newStartTime, newEndTime) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.lessons.move(id, dayOfWeek, newStartTime, newEndTime));
      set(state => ({
        lessons: state.lessons.map(l =>
          l.id === id ? { ...l, dayOfWeek, startTime: newStartTime, endTime: newEndTime } : l
        )
      }));
    } catch (error) {
      console.error('Failed to move lesson:', error);
      throw error;
    }
  }
}));
