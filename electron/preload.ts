import { contextBridge, ipcRenderer } from 'electron';
import type { IpcResponse } from '@shared/types';

const api = {
  students: {
    getAll: (): Promise<IpcResponse<any[]>> => ipcRenderer.invoke('students:getAll'),
    getById: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('students:getById', id),
    create: (data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('students:create', data),
    update: (id: number, data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('students:update', id, data),
    delete: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('students:delete', id),
    getStats: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('students:getStats', id),
  },
  lessons: {
    getAll: (startDate?: string, endDate?: string): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('lessons:getAll', startDate, endDate),
    getById: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('lessons:getById', id),
    getByStudent: (studentId: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('lessons:getByStudent', studentId),
    create: (data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('lessons:create', data),
    update: (id: number, data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('lessons:update', id, data),
    delete: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('lessons:delete', id),
    move: (id: number, dayOfWeek: number, startTime: string, endTime: string): Promise<IpcResponse<void>> => 
      ipcRenderer.invoke('lessons:move', id, dayOfWeek, startTime, endTime),
  },
  records: {
    getAll: (studentId?: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('records:getAll', studentId),
    getById: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('records:getById', id),
    create: (data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('records:create', data),
    update: (id: number, data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('records:update', id, data),
    delete: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('records:delete', id),
  },
  homework: {
    getAll: (studentId?: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('homework:getAll', studentId),
    getById: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('homework:getById', id),
    getSections: (homeworkId: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('homework:getSections', homeworkId),
    getRecordings: (sectionId: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('homework:getRecordings', sectionId),
    createHomework: (data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:createHomework', data),
    updateHomework: (id: number, data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:updateHomework', id, data),
    deleteHomework: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('homework:deleteHomework', id),
    createSection: (data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:createSection', data),
    updateSection: (id: number, data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:updateSection', id, data),
    updateSectionStatus: (id: number, status: any): Promise<IpcResponse<void>> => 
      ipcRenderer.invoke('homework:updateSectionStatus', id, status),
    deleteSection: (id: number): Promise<IpcResponse<void>> => 
      ipcRenderer.invoke('homework:deleteSection', id),
    createRecording: (data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:createRecording', data),
    updateRecording: (id: number, data: any): Promise<IpcResponse<any>> => 
      ipcRenderer.invoke('homework:updateRecording', id, data),
    deleteRecording: (id: number): Promise<IpcResponse<void>> => 
      ipcRenderer.invoke('homework:deleteRecording', id),
  },
  billing: {
    getAll: (studentId?: number): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('billing:getAll', studentId),
    getById: (id: number): Promise<IpcResponse<any>> => ipcRenderer.invoke('billing:getById', id),
    getMonthlyStats: (): Promise<IpcResponse<any[]>> => 
      ipcRenderer.invoke('billing:getMonthlyStats'),
    getSummary: (): Promise<IpcResponse<any>> => ipcRenderer.invoke('billing:getSummary'),
    create: (data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('billing:create', data),
    update: (id: number, data: any): Promise<IpcResponse<any>> => ipcRenderer.invoke('billing:update', id, data),
    delete: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('billing:delete', id),
    togglePaid: (id: number): Promise<IpcResponse<void>> => ipcRenderer.invoke('billing:togglePaid', id),
  },
  files: {
    selectAudio: (): Promise<IpcResponse<string>> => ipcRenderer.invoke('files:selectAudio'),
    saveAudio: (fileName: string, arrayBuffer: ArrayBuffer): Promise<IpcResponse<string>> => 
      ipcRenderer.invoke('files:saveAudio', fileName, arrayBuffer),
    savePdf: (fileName: string, arrayBuffer: ArrayBuffer): Promise<IpcResponse<string>> => 
      ipcRenderer.invoke('files:savePdf', fileName, arrayBuffer),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type ApiType = typeof api;
