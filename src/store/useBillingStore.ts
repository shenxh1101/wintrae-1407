import { create } from 'zustand';
import type { BillingRecord, MonthlyStats, BillingSummary } from '@/types';
import { getApi, handleIpcResponse } from '@/utils/ipc';

interface BillingStore {
  records: BillingRecord[];
  monthlyStats: MonthlyStats[];
  summary: BillingSummary | null;
  loading: boolean;
  error: string | null;
  fetchAll: (studentId?: number) => Promise<void>;
  fetchMonthlyStats: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  create: (data: Omit<BillingRecord, 'id' | 'createdAt'>) => Promise<BillingRecord>;
  update: (id: number, data: Partial<Omit<BillingRecord, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  togglePaid: (id: number) => Promise<void>;
}

export const useBillingStore = create<BillingStore>((set, get) => ({
  records: [],
  monthlyStats: [],
  summary: null,
  loading: false,
  error: null,

  fetchAll: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const records = await handleIpcResponse(await api.billing.getAll(studentId));
      set({ records, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchMonthlyStats: async () => {
    try {
      const api = getApi();
      const stats = await handleIpcResponse(await api.billing.getMonthlyStats());
      set({ monthlyStats: stats });
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
    }
  },

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const summary = await handleIpcResponse(await api.billing.getSummary());
      set({ summary, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const record = await handleIpcResponse(await api.billing.create(data));
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
      await handleIpcResponse(await api.billing.update(id, data));
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
      await handleIpcResponse(await api.billing.delete(id));
      set(state => ({
        records: state.records.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  togglePaid: async (id) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.billing.togglePaid(id));
      set(state => ({
        records: state.records.map(r =>
          r.id === id ? { ...r, isPaid: !r.isPaid } : r
        )
      }));
    } catch (error) {
      console.error('Failed to toggle paid status:', error);
      throw error;
    }
  }
}));
