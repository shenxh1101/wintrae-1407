import { create } from 'zustand';
import type { LessonRecord } from '@/types';
import { getApi, handleIpcResponse } from '@/utils/ipc';

interface LessonStore {
  records: LessonRecord[];
  selectedRecordId: number | null;
  loading: boolean;
  error: string | null;
  fetchAll: (studentId?: number) => Promise<void>;
  fetchById: (id: number) => Promise<LessonRecord | undefined>;
  create: (data: Omit<LessonRecord, 'id' | 'createdAt'>) => Promise<LessonRecord>;
  update: (id: number, data: Partial<Omit<LessonRecord, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setSelected: (id: number | null) => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  records: [],
  selectedRecordId: null,
  loading: false,
  error: null,

  fetchAll: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const records = await handleIpcResponse(await api.records.getAll(studentId));
      set({ records, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const record = await handleIpcResponse(await api.records.getById(id));
      if (record) {
        set(state => ({
          records: state.records.map(r => r.id === id ? record : r),
          loading: false
        }));
      }
      return record;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const record = await handleIpcResponse(await api.records.create(data));
      set(state => ({
        records: [record, ...state.records].sort((a, b) => b.date.localeCompare(a.date)),
        loading: false
      }));
      return record;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.records.update(id, data));
      set(state => ({
        records: state.records.map(r => r.id === id ? { ...r, ...data } : r),
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
      await handleIpcResponse(await api.records.delete(id));
      set(state => ({
        records: state.records.filter(r => r.id !== id),
        selectedRecordId: state.selectedRecordId === id ? null : state.selectedRecordId,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setSelected: (id) => {
    set({ selectedRecordId: id });
  }
}));
