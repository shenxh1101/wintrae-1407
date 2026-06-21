import { create } from 'zustand';
import type { Homework, PracticeSection, Recording, SectionStatus } from '@/types';
import { getApi, handleIpcResponse } from '@/utils/ipc';

interface HomeworkStore {
  homeworkList: Homework[];
  sections: Record<number, PracticeSection[]>;
  recordings: Record<number, Recording[]>;
  selectedHomeworkId: number | null;
  loading: boolean;
  error: string | null;
  fetchAll: (studentId?: number) => Promise<void>;
  fetchSections: (homeworkId: number) => Promise<void>;
  fetchRecordings: (sectionId: number) => Promise<void>;
  createHomework: (data: Omit<Homework, 'id' | 'createdAt'>) => Promise<Homework>;
  updateHomework: (id: number, data: Partial<Omit<Homework, 'id' | 'createdAt'>>) => Promise<void>;
  removeHomework: (id: number) => Promise<void>;
  createSection: (data: Omit<PracticeSection, 'id' | 'createdAt'>) => Promise<PracticeSection>;
  updateSection: (id: number, data: Partial<Omit<PracticeSection, 'id' | 'homeworkId' | 'createdAt'>>) => Promise<void>;
  updateSectionStatus: (id: number, status: SectionStatus) => Promise<void>;
  removeSection: (id: number) => Promise<void>;
  createRecording: (data: Omit<Recording, 'id'>) => Promise<Recording>;
  updateRecording: (id: number, data: Partial<Omit<Recording, 'id' | 'sectionId'>>) => Promise<void>;
  removeRecording: (id: number) => Promise<void>;
  setSelected: (id: number | null) => void;
}

export const useHomeworkStore = create<HomeworkStore>((set, get) => ({
  homeworkList: [],
  sections: {},
  recordings: {},
  selectedHomeworkId: null,
  loading: false,
  error: null,

  fetchAll: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const homeworkList = await handleIpcResponse(await api.homework.getAll(studentId));
      set({ homeworkList, loading: false });

      for (const homework of homeworkList) {
        await get().fetchSections(homework.id);
      }

      const allSections = Object.values(get().sections).flat();
      for (const section of allSections) {
        await get().fetchRecordings(section.id);
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchSections: async (homeworkId) => {
    try {
      const api = getApi();
      const sections = await handleIpcResponse(await api.homework.getSections(homeworkId));
      set(state => ({
        sections: { ...state.sections, [homeworkId]: sections }
      }));
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  },

  fetchRecordings: async (sectionId) => {
    try {
      const api = getApi();
      const recordings = await handleIpcResponse(await api.homework.getRecordings(sectionId));
      set(state => ({
        recordings: { ...state.recordings, [sectionId]: recordings }
      }));
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  },

  createHomework: async (data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      const homework = await handleIpcResponse(await api.homework.createHomework(data));
      set(state => ({
        homeworkList: [homework, ...state.homeworkList].sort((a, b) => b.assignedDate.localeCompare(a.assignedDate)),
        loading: false
      }));
      return homework;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateHomework: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.updateHomework(id, data));
      set(state => ({
        homeworkList: state.homeworkList.map(h => h.id === id ? { ...h, ...data } : h),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  removeHomework: async (id) => {
    set({ loading: true, error: null });
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.deleteHomework(id));
      set(state => {
        const newSections = { ...state.sections };
        delete newSections[id];
        return {
          homeworkList: state.homeworkList.filter(h => h.id !== id),
          selectedHomeworkId: state.selectedHomeworkId === id ? null : state.selectedHomeworkId,
          sections: newSections,
          loading: false
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  createSection: async (data) => {
    try {
      const api = getApi();
      const newSection = await handleIpcResponse(await api.homework.createSection(data));
      set(state => ({
        sections: {
          ...state.sections,
          [data.homeworkId]: [...(state.sections[data.homeworkId] || []), newSection]
        }
      }));
      return newSection;
    } catch (error) {
      console.error('Failed to create section:', error);
      throw error;
    }
  },

  updateSection: async (id, data) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.updateSection(id, data));
      set(state => {
        const newSections = { ...state.sections };
        for (const homeworkId in newSections) {
          newSections[Number(homeworkId)] = newSections[Number(homeworkId)].map(s =>
            s.id === id ? { ...s, ...data } : s
          );
        }
        return { sections: newSections };
      });
    } catch (error) {
      console.error('Failed to update section:', error);
      throw error;
    }
  },

  updateSectionStatus: async (id, status) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.updateSectionStatus(id, status));
      set(state => {
        const newSections = { ...state.sections };
        for (const homeworkId in newSections) {
          newSections[Number(homeworkId)] = newSections[Number(homeworkId)].map(s =>
            s.id === id ? { ...s, status } : s
          );
        }
        return { sections: newSections };
      });
    } catch (error) {
      console.error('Failed to update section status:', error);
      throw error;
    }
  },

  removeSection: async (id) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.deleteSection(id));
      set(state => {
        const newSections = { ...state.sections };
        for (const homeworkId in newSections) {
          newSections[Number(homeworkId)] = newSections[Number(homeworkId)].filter(s => s.id !== id);
        }
        return { sections: newSections };
      });
    } catch (error) {
      console.error('Failed to remove section:', error);
      throw error;
    }
  },

  createRecording: async (data) => {
    try {
      const api = getApi();
      const recording = await handleIpcResponse(await api.homework.createRecording(data));
      set(state => ({
        recordings: {
          ...state.recordings,
          [data.sectionId]: [recording, ...(state.recordings[data.sectionId] || [])]
        }
      }));
      return recording;
    } catch (error) {
      console.error('Failed to create recording:', error);
      throw error;
    }
  },

  updateRecording: async (id, data) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.updateRecording(id, data));
      set(state => {
        const newRecordings = { ...state.recordings };
        for (const sectionId in newRecordings) {
          newRecordings[Number(sectionId)] = newRecordings[Number(sectionId)].map(r =>
            r.id === id ? { ...r, ...data } : r
          );
        }
        return { recordings: newRecordings };
      });
    } catch (error) {
      console.error('Failed to update recording:', error);
      throw error;
    }
  },

  removeRecording: async (id) => {
    try {
      const api = getApi();
      await handleIpcResponse(await api.homework.deleteRecording(id));
      set(state => {
        const newRecordings = { ...state.recordings };
        for (const sectionId in newRecordings) {
          newRecordings[Number(sectionId)] = newRecordings[Number(sectionId)].filter(r => r.id !== id);
        }
        return { recordings: newRecordings };
      });
    } catch (error) {
      console.error('Failed to remove recording:', error);
      throw error;
    }
  },

  setSelected: (id) => {
    set({ selectedHomeworkId: id });
  }
}));
